export type FilePurpose =
  | "profile-image"
  | "cover-image"
  | "film"
  | "news"
  | "opportunity"
  | "newsletter"
  | "document";

export type StoredFile = {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  publicUrl: string | null;
};
