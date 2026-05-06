export interface Game {
  id: string;
  name: string;
  description: string;
  min_players: number;
  max_players: number;
  duration_minutes: number;
  difficulty: string;
  tags: string[];
  icon: string;
  online_count: number;
  room_count: number;
  hot: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  is_ready: boolean;
  is_host: boolean;
  is_online: boolean;
  joined_at: string;
}

export type RoomStatus = "Waiting" | "Playing" | "Finished";

export interface Room {
  id: string;
  name: string;
  game_id: string;
  game_name: string;
  host_id: string;
  host_name: string;
  players: Player[];
  max_players: number;
  is_private: boolean;
  password: string | null;
  status: RoomStatus;
  game_mode: string;
  created_at: string;
  has_password: boolean;
  short_id: string | null;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  is_system: boolean;
}

export interface OnlineFriend {
  id: string;
  name: string;
  avatar: string;
  status: string;
  current_game: string | null;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  time: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  total_games: number;
  win_rate: number;
  favorite_game: string;
  joined_date: string;
  bio: string;
}

export interface HomeStats {
  online_players: number;
  active_rooms: number;
  games_in_play: number;
  hot_games: Game[];
  hot_rooms: Room[];
  online_friends: OnlineFriend[];
  announcements: PlatformAnnouncement[];
  user_profile: UserProfile;
}

export interface CreateRoomPayload {
  name: string;
  game_id: string;
  game_name: string;
  max_players: number;
  is_private: boolean;
  password: string | null;
  game_mode: string;
}

export interface RoomFilter {
  keyword?: string;
  status?: string;
  game_mode?: string;
}

export interface ChatPayload {
  room_id: string;
  content: string;
}
