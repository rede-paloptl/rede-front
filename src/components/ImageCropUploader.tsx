"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Move, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { uploadFile } from "@/actions/files";
import type { FilePurpose } from "@/types/File";

type CropPosition = { x: number; y: number };

type ImageCropUploaderProps = {
  value?: string;
  purpose: Extract<FilePurpose, "profile-image" | "cover-image" | "film">;
  aspectRatio?: number;
  height?: number; // NOVO: quando definido, fixa a altura e ignora aspectRatio
  cropShape?: "rect" | "circle";
  minHeight?: number;
  emptyLabel?: string;
  helperText?: string;
  uploadLabel?: string;
  uploadingLabel?: string;
  disabled?: boolean;
  className?: string;
  onUploaded: (url: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

// O recorte sai sempre em JPEG: uma foto de 1200px fica bem abaixo do limite
// de 2MB da API, o que em PNG nao e garantido.
const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_QUALITY = 0.9;
const OUTPUT_BACKGROUND = "#1D1D1B";

const toJpegFileName = (fileName: string) =>
  `${fileName.replace(/\.[^.]+$/, "") || "imagem"}.jpg`;

const createCroppedFile = async (
  imageUrl: string,
  fileName: string,
  zoom: number,
  position: CropPosition,
  aspectRatio: number,
) => {
  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Não foi possível preparar a imagem."));
    image.src = imageUrl;
  });

  const outputWidth = 1200;
  const outputHeight = Math.round(outputWidth / aspectRatio);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível recortar a imagem.");

  const baseScale = Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
  const scale = baseScale * zoom;
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  const offsetX = (renderedWidth - outputWidth) * (position.x / 100);
  const offsetY = (renderedHeight - outputHeight) * (position.y / 100);

  // JPEG nao tem transparencia: sem fundo, as zonas transparentes de um PNG
  // ficariam pretas.
  context.fillStyle = OUTPUT_BACKGROUND;
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(image, -offsetX, -offsetY, renderedWidth, renderedHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Não foi possível gerar a imagem recortada."));
    }, OUTPUT_TYPE, OUTPUT_QUALITY);
  });

  return new File([blob], toJpegFileName(fileName), { type: OUTPUT_TYPE });
};

export const ImageCropUploader: React.FC<ImageCropUploaderProps> = ({
  value = "",
  purpose,
  aspectRatio = 16 / 9,
  cropShape = "rect",
  height,
  minHeight = 252,
  emptyLabel = "Clique para escolher uma imagem",
  helperText = "Arraste para reposicionar e ajuste o zoom antes de guardar.",
  uploadLabel = "Guardar imagem",
  uploadingLabel = "A enviar...",
  disabled = false,
  className = "",
  onUploaded,
  onError,
}) => {
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<CropPosition>({ x: 50, y: 50 });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origin: CropPosition } | null>(null);

  const previewUrl = selectedPreviewUrl || value;

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    };
  }, [selectedPreviewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError?.("O arquivo deve ser uma imagem.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedPreviewUrl(nextPreviewUrl);
    setZoom(1);
    setPosition({ x: 50, y: 50 });
    onError?.("");
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!previewUrl || disabled || isUploading) return;
    dragRef.current = { startX: event.clientX, startY: event.clientY, origin: position };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;

    const { startX, startY, origin } = dragRef.current;
    const deltaX = ((event.clientX - startX) / 300) * 100;
    const deltaY = ((event.clientY - startY) / 220) * 100;

    setPosition({
      x: Math.min(100, Math.max(0, origin.x + deltaX)),
      y: Math.min(100, Math.max(0, origin.y + deltaY)),
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) {
      fileInputRef.current?.click();
      return;
    }

    setIsUploading(true);
    onError?.("");

    try {
      const croppedFile = await createCroppedFile(previewUrl, selectedFile.name, zoom, position, aspectRatio);
      const response = await uploadFile(croppedFile, purpose);
      const url = response.data?.file.publicUrl;

      if (response.error || !url) {
        throw new Error(response.message ?? "Não foi possível enviar a imagem.");
      }

      await onUploaded(url);
      setSelectedFile(null);
      setSelectedPreviewUrl("");
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div
  className={`relative w-full overflow-hidden border-[1.3px] border-dashed border-rede-white/900 bg-rede-surface-800 select-none ${previewUrl ? "cursor-move" : ""} ${cropShape === "circle" ? "rounded-full" : ""}`}
  style={height ? { height } : { aspectRatio, minHeight }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerLeave={handlePointerUp}
>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Imagem selecionada"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            style={{ transform: `scale(${zoom})`, objectPosition: `${position.x}% ${position.y}%` }}
            draggable={false}
          />
        ) : (
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center text-rede-white/50 text-btn2"
          >
            {emptyLabel}
          </button>
        )}

        {previewUrl && (
          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 pointer-events-none">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-rede-white">
              <Move width={14} height={14} />
            </span>
            <span className="rounded-full bg-black/60 px-4 py-2 text-xs text-rede-white whitespace-nowrap">
              Arraste para reposicionar
            </span>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex w-1/2 items-center gap-1">
          <ZoomOut width={16} height={16} className="text-rede-white/60 shrink-0" />
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.01}
            value={zoom}
            disabled={!previewUrl || disabled || isUploading}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1 accent-rede-yellow-500 disabled:opacity-40"
          />
          <ZoomIn width={16} height={16} className="text-rede-white/60 shrink-0" />
        </div>
        <Text className="w-1/2 text-[12px] leading-4 text-rede-white/30">{helperText}</Text>
      </div>

      <div className="flex justify-end gap-2">
        {previewUrl && (
          <Button variant="secondary" disabled={disabled || isUploading} onClick={() => fileInputRef.current?.click()}>
            Trocar imagem
          </Button>
        )}
        <Button disabled={disabled || isUploading} icon={<Upload width={12} height={12} />} iconPosition="left" onClick={handleUpload}>
          {isUploading ? uploadingLabel : uploadLabel}
        </Button>
      </div>
    </div>
  );
};
