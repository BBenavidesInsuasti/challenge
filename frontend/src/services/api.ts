import axios from "axios";
import type {
  AuthResponse,
  Collection,
  CollectionImage,
  NASAImage,
  RoverPhoto,
  AIEnrichment,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),

  register: (email: string, password: string, name: string) =>
    api.post<AuthResponse>("/auth/register", { email, password, name }).then((r) => r.data),

  getMe: () => api.get<{ user: import("../types").User }>("/auth/me").then((r) => r.data.user),
};

export const imagesApi = {
  search: (query: string, filters?: { year?: string; page?: number }) =>
    api
      .get<{ results: NASAImage[]; total: number }>("/images/search", {
        params: { q: query, ...filters },
      })
      .then((r) => r.data),

  getById: (nasaId: string) =>
    api.get<NASAImage>(`/images/${nasaId}`).then((r) => r.data),

  getRoverPhotos: (rover: string, sol?: number, camera?: string) =>
    api
      .get<{ photos: RoverPhoto[] }>(`/images/rovers/${rover}`, {
        params: { sol, camera },
      })
      .then((r) => r.data),
};

export const collectionsApi = {
  list: () =>
    api.get<{ collections: Collection[] }>("/collections").then((r) => r.data.collections),

  create: (name: string, description?: string) =>
    api.post<{ collection: Collection }>("/collections", { name, description }).then((r) => r.data.collection),

  getById: (id: number) =>
    api
      .get<{ collection: Collection; images: CollectionImage[] }>(`/collections/${id}`)
      .then((r) => r.data),

  update: (id: number, data: Partial<Pick<Collection, "name" | "description">>) =>
    api.put<{ collection: Collection }>(`/collections/${id}`, data).then((r) => r.data.collection),

  delete: (id: number) => api.delete(`/collections/${id}`).then((r) => r.data),

  addImage: (collectionId: number, imageData: {
    nasa_id: string;
    title?: string;
    description?: string;
    image_url?: string;
    thumbnail_url?: string;
    date_created?: string;
  }) =>
    api
      .post<{ image: CollectionImage }>(`/collections/${collectionId}/images`, imageData)
      .then((r) => r.data.image),

  removeImage: (collectionId: number, imageId: number) =>
    api.delete(`/collections/${collectionId}/images/${imageId}`).then((r) => r.data),
};

export const aiApi = {
  enrich: (title: string, description?: string) =>
    api.post<AIEnrichment>("/enrich", { title, description }).then((r) => r.data),
  compare: (data: {
    title1: string;
    description1?: string;
    title2: string;
    description2?: string;
  }) => api.post<import("../types").AIComparison>("/compare", data).then((r) => r.data),
};
