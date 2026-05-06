import { create } from "zustand";
import { api, setToken, getToken } from "../api/client";

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  total_games: number;
  win_rate: number;
  favorite_game: string;
  created_at: string;
  account_id: string | null;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: getToken(),
  loading: false,
  error: null,
  isAuthenticated: !!getToken(),

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post<AuthResponse>("/auth/login", { email, password });
      setToken(data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
      throw e;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post<AuthResponse>("/auth/register", { username, email, password });
      setToken(data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
      throw e;
    }
  },

  logout: () => {
    setToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const user = await api.get<User>("/auth/me");
      set({ user, isAuthenticated: true, loading: false });
    } catch {
      set({ isAuthenticated: false, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
