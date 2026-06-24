import { create } from "zustand";
import { collectionsApi } from "../services/api";
import type { Collection, CollectionImage } from "../types";

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  currentImages: CollectionImage[];
  loading: boolean;
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: number) => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<Collection>;
  updateCollection: (id: number, data: Partial<Pick<Collection, "name" | "description">>) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  addImage: (collectionId: number, imageData: Parameters<typeof collectionsApi.addImage>[1]) => Promise<void>;
  removeImage: (collectionId: number, imageId: number) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  currentCollection: null,
  currentImages: [],
  loading: false,

  fetchCollections: async () => {
    set({ loading: true });
    try {
      const collections = await collectionsApi.list();
      set({ collections, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCollection: async (id) => {
    set({ loading: true });
    try {
      const { collection, images } = await collectionsApi.getById(id);
      set({ currentCollection: collection, currentImages: images, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createCollection: async (name, description) => {
    const collection = await collectionsApi.create(name, description);
    set((state) => ({ collections: [collection, ...state.collections] }));
    return collection;
  },

  updateCollection: async (id, data) => {
    const collection = await collectionsApi.update(id, data);
    set((state) => ({
      collections: state.collections.map((c) => (c.id === id ? collection : c)),
      currentCollection: collection,
    }));
  },

  deleteCollection: async (id) => {
    await collectionsApi.delete(id);
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
      currentCollection: null,
    }));
  },

  addImage: async (collectionId, imageData) => {
    const image = await collectionsApi.addImage(collectionId, imageData);
    set((state) => ({
      currentImages: [image, ...state.currentImages],
    }));
  },

  removeImage: async (collectionId, imageId) => {
    await collectionsApi.removeImage(collectionId, imageId);
    set((state) => ({
      currentImages: state.currentImages.filter((img) => img.id !== imageId),
    }));
  },
}));
