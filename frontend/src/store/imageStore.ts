import { create } from "zustand";
import { imagesApi, aiApi } from "../services/api";
import type { NASAImage, RoverPhoto, AIEnrichment } from "../types";

interface ImageState {
  images: NASAImage[];
  roverPhotos: RoverPhoto[];
  selectedImage: NASAImage | null;
  aiEnrichment: AIEnrichment | null;
  loading: boolean;
  enriching: boolean;
  totalResults: number;
  currentQuery: string;
  searchMode: "nasa" | "rovers";
  search: (query: string, filters?: { year?: string; page?: number }, append?: boolean) => Promise<void>;
  fetchRoverPhotos: (rover: string, sol?: number, camera?: string) => Promise<void>;
  selectImage: (image: NASAImage | null) => void;
  enrichImage: (title: string, description?: string) => Promise<void>;
  clearSearch: () => void;
  setSearchMode: (mode: "nasa" | "rovers") => void;
}

export const useImageStore = create<ImageState>((set) => ({
  images: [],
  roverPhotos: [],
  selectedImage: null,
  aiEnrichment: null,
  loading: false,
  enriching: false,
  totalResults: 0,
  currentQuery: "",
  searchMode: "nasa",

  search: async (query, filters, append = false) => {
    set({ loading: true, ...(append ? {} : { currentQuery: query, aiEnrichment: null }) });
    try {
      const { results, total } = await imagesApi.search(query, filters);
      set((state) => ({
        images: append ? [...state.images, ...results] : results,
        totalResults: total,
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  fetchRoverPhotos: async (rover, sol, camera) => {
    set({ loading: true });
    try {
      const { photos } = await imagesApi.getRoverPhotos(rover, sol, camera);
      set({ roverPhotos: photos, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  selectImage: (image) => {
    set({ selectedImage: image, aiEnrichment: null });
  },

  enrichImage: async (title, description) => {
    set({ enriching: true });
    try {
      const enrichment = await aiApi.enrich(title, description || "");
      set({ aiEnrichment: enrichment, enriching: false });
    } catch {
      set({ enriching: false });
    }
  },

  clearSearch: () => {
    set({
      images: [],
      roverPhotos: [],
      selectedImage: null,
      aiEnrichment: null,
      totalResults: 0,
      currentQuery: "",
    });
  },

  setSearchMode: (mode) => {
    set({ searchMode: mode, images: [], roverPhotos: [] });
  },
}));
