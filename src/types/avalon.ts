export type GamePhase = "RoleReveal" | "Proposal" | "Discussion" | "Vote" | "Mission" | "Result" | "Assassination" | "End";
export type Alignment = "Good" | "Evil";
export type RoleName = "Merlin" | "Percival" | "LoyalServant" | "Assassin" | "Minion" | "Morgana" | "Mordred" | "Oberon";

export const ROLE_NAMES: Record<RoleName, string> = {
  Merlin: "梅林",
  Percival: "派西维尔",
  LoyalServant: "忠臣",
  Assassin: "刺客",
  Minion: "爪牙",
  Morgana: "莫甘娜",
  Mordred: "莫德雷德",
  Oberon: "奥伯伦",
};

export interface PlayerViewInfo {
  user_id: string; username: string; avatar: string;
  is_leader: boolean; known_evil: boolean; known_role: string | null;
  is_connected: boolean; is_ai_controlled: boolean;
}

export interface RoundRecord {
  round: number;
  leader_id: string;
  leader_name: string;
  team: string[];
  team_votes: Record<string, string>;
  team_approved: boolean;
  mission_success: boolean;
  mission_vote_count: number;
  success_count: number;
  fail_count: number;
}

export interface PlayerGameView {
  your_role: RoleName | null;
  your_alignment: Alignment | null;
  phase: GamePhase;
  round: number;
  players: PlayerViewInfo[];
  mission_team: string[];
  mission_results: (boolean | null)[];
  mission_sizes: number[];
  consecutive_veto: number;
  winner: Alignment | null;
  is_your_turn: boolean;
  all_roles: Record<string, RoleName>;
  round_history: RoundRecord[];
  settlement_confirmed: string[];
  assassin_target: string | null;
  speaking_phase: boolean;
  speaking_queue: string[];
  current_speaker: string | null;
  speaking_remaining: number;
  proposal_ready: boolean;
  assassination_visibility: Record<string, { alignment: "Good"|"Evil"; role: string | null }>;
}
