export interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
}

export interface Collection {
  id: number;
  user_id: number;
  name: string;
  description: string;
  image_count?: number;
  created_at?: string;
}

export interface CollectionImage {
  id: number;
  collection_id: number;
  nasa_id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  date_created: string;
  metadata: string;
  added_at?: string;
}

export interface NASAImage {
  nasaId: string;
  title: string;
  description: string;
  thumbnail: string;
  imageUrl: string;
  dateCreated: string;
  photographer?: string;
  location?: string;
}

export interface RoverPhoto {
  id: number;
  imgSrc: string;
  roverName: string;
  cameraName: string;
  sol: number;
  earthDate: string;
}

export interface AIEnrichment {
  funFact: string;
  historicalContext: string;
  tags: string[];
  aiSummary: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}
