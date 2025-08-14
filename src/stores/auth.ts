import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { UserDTO } from "@/types/api";
// Removed wsClient import to avoid duplicate connections
import { auth } from "@/lib/api";

export interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserDTO | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: UserDTO) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserDTO>) => void;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => {
      set({ user, isAuthenticated: !!user, isLoading: false });
    },

    setLoading: (loading) => {
      set({ isLoading: loading });
    },

    login: (user) => {
      set({ user, isAuthenticated: true, isLoading: false });
      // Do not connect WebSocket here; AppAuthProvider handles it
    },

    logout: () => {
      set({ user: null, isAuthenticated: false, isLoading: false });
      // Do not disconnect WebSocket here; AppAuthProvider handles it
      auth.removeTokens();
    },

    updateUser: (updates) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...updates } });
      }
    },
  })),
);
