import { create } from "zustand";
import { api } from "../api/client";

export interface Friend {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  status: string;
  online_status: string;
  room_id: string | null;
  room_name: string | null;
  game_name: string | null;
  game_mode: string | null;
  player_count: number | null;
  max_players: number | null;
  has_password: boolean | null;
  created_at: string;
}

interface FriendStore {
  friends: Friend[];
  loading: boolean;
  fetchFriends: () => Promise<void>;
  addFriend: (uid: string) => Promise<void>;
  acceptFriend: (requestId: string) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  searchUser: (uid: string) => Promise<{ found: boolean; user?: { id: string; username: string; avatar: string } }>;
}

export const useFriendStore = create<FriendStore>((set) => ({
  friends: [],
  loading: false,
  fetchFriends: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Friend[]>("/friends");
      set({ friends: data, loading: false });
    } catch { set({ loading: false }); }
  },
  addFriend: async (uid: string) => {
    await api.post("/friends/add", { friend_uid: uid });
  },
  acceptFriend: async (requestId: string) => {
    await api.post("/friends/accept", { request_id: requestId });
    const data = await api.get<Friend[]>("/friends");
    set({ friends: data });
  },
  removeFriend: async (id: string) => {
    await api.delete(`/friends/${id}`);
    set((s) => ({ friends: s.friends.filter(f => f.id !== id) }));
  },
  searchUser: async (uid: string) => {
    return api.get(`/friends/search?uid=${uid}`);
  },
}));
