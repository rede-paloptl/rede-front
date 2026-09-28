import { FilmType } from './Films'

// Os géneros e os países dos filmes vêm das listas de Configurações
// (lib/taxonomy): os filmes abaixo guardam o slug, que a taxonomia reconhece.


export const licensingItems = [
  {
    title: "Ideal para festivais",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Duração da Licença",
    content:
      "Licença válida conforme os termos acordados entre as partes.",
  },
  {
    title: "Território",
    content:
      "Disponível para licenciamento nacional ou internacional.",
  },
  {
    title: "Custos e Taxas",
    content:
      "Os custos variam de acordo com o tipo de utilização pretendida.",
  },
  {
    title: "Requisitos Técnicos",
    content:
      "Entrega em formato ProRes, H264 ou DCP, dependendo da finalidade.",
  },
]


export const packages = [
  {
    title: "Curadoria 1",
    type: "Uso comercial",
  },
  {
    title: "Curadoria 2",
    type: "Uso não comercial",
  },
  {
    title: "Curadoria 3",
    type: "Uso não comercial",
  },
  {
    title: "Curadoria 4",
    type: "Uso comercial",
  },
  {
    title: "Curadoria 5",
    type: "Uso não comercial",
  },
  {
    title: "Curadoria 6",
    type: "Uso não comercial",
  },
]


export const films: FilmType[] = [
  {
    id: 'uma-historia-de-angola',
    title: 'Título',
    director: 'Realizador',
    duration: '28\'32"',
    year: '2025',
    tags: [{ label: 'Angola' }, { label: 'Ficção' }, { label: 'Direitos Humanos' }],
    thumbnail: '/assets/agency/movies/image-1.png',
    country: 'angola',
    genre: 'ficcao',
  },
  {
    id: 'vozes-do-atlantico',
    title: 'Título',
    director: 'Realizador',
    duration: '32\'15"',
    year: '2025',
    tags: [{ label: 'Moçambique' }, { label: 'Ficção' }, { label: 'Género' }, { label: 'Animação' }],
    thumbnail: '/assets/agency/movies/image-2.png',
    country: 'mocambique',
    genre: 'animacao',
  },
  {
    id: 'ilhas-do-atlantico',
    title: 'Título',
    director: 'Realizador',
    duration: '28\'20"',
    year: '2024',
    tags: [{ label: 'Cabo Verde' }, { label: 'Experimental' }, { label: 'Ambiente' }],
    thumbnail: '/assets/agency/movies/image-3.png',
    country: 'cabo-verde',
    genre: 'experimental',
  },
  {
    id: 'sao-tome-terra-e-mar',
    title: 'Título',
    director: 'Realizador',
    duration: '28\'20"',
    year: '2024',
    tags: [{ label: 'São Tomé' }, { label: 'Experimental' }, { label: 'Ambiente' }],
    thumbnail: '/assets/agency/movies/image-4.png',
    country: 'sao-tome-e-principe',
    genre: 'experimental',
  },
  {
    id: 'caminhos-da-guine',
    title: 'Título',
    director: 'Realizador',
    duration: '28\'20"',
    year: '2023',
    tags: [{ label: 'Guiné-Bissau' }, { label: 'Animação' }, { label: 'Direitos Humanos' }],
    thumbnail: '/assets/agency/movies/image-5.png',
    country: 'guine-bissau',
    genre: 'animacao',
  },
  {
    id: 'timor-entre-mundos',
    title: 'Título',
    director: 'Realizador',
    duration: '28\'20"',
    year: '2023',
    tags: [{ label: 'Timor-Leste' }, { label: 'Documentário' }, { label: 'Direitos Humanos' }],
    thumbnail: '/assets/agency/movies/image-6.png',
    country: 'timor-leste',
    genre: 'documentario',
  },
]