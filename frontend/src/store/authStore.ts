import { create } from "zustand";
import { authApi } from "../services/api";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("token"),
  user: null,
  loading: false,

  login: async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem("token", token);
    set({ token, user });
  },

  register: async (email, password, name) => {
    const { token, user } = await authApi.register(email, password, name);
    localStorage.setItem("token", token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;

    set({ loading: true });
    try {
      const user = await authApi.getMe();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem("token");
      set({ token: null, user: null, loading: false });
    }
  },

  isAuthenticated: () => !!get().token,
}));
