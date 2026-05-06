use crate::models::{
    game::Game,
    room::Room,
    player::{OnlineFriend, UserProfile, PlatformAnnouncement},
    chat::ChatMessage,
};
use serde::{Deserialize, Serialize};
use chrono::Local;

pub struct AppState {
    pub rooms: Vec<Room>,
    pub chat_history: Vec<ChatMessage>,
    pub current_player_id: String,
    pub current_player_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HomeStats {
    pub online_players: u32,
    pub active_rooms: u32,
    pub games_in_play: u32,
    pub hot_games: Vec<Game>,
    pub hot_rooms: Vec<Room>,
    pub online_friends: Vec<OnlineFriend>,
    pub announcements: Vec<PlatformAnnouncement>,
    pub user_profile: UserProfile,
}

impl AppState {
    pub fn new() -> Self {
        let player_id = "p1".to_string();
        let player_name = "旅行者".to_string();
        let now = Local::now().format("%H:%M").to_string();

        let rooms = vec![
            Room {
                id: "r1".into(), name: "阿瓦隆-新手友好局".into(), game_id: "avalon".into(), game_name: "阿瓦隆".into(),
                host_id: "p3".into(), host_name: "桌游达人".into(),
                players: vec![
                    crate::models::player::Player { id: "p3".into(), name: "桌游达人".into(), avatar: "👑".into(), is_ready: true, is_host: true, is_online: true, joined_at: now.clone() },
                    crate::models::player::Player { id: "p4".into(), name: "推理大师".into(), avatar: "🧠".into(), is_ready: true, is_host: false, is_online: true, joined_at: now.clone() },
                    crate::models::player::Player { id: "p5".into(), name: "新手小白".into(), avatar: "🌱".into(), is_ready: false, is_host: false, is_online: true, joined_at: now.clone() },
                ],
                max_players: 8, is_private: false, password: None, status: crate::models::room::RoomStatus::Waiting,
                game_mode: "经典".into(), created_at: "10:30".into(), has_password: false,
            },
            Room {
                id: "r2".into(), name: "狼人杀-高手对决".into(), game_id: "werewolf".into(), game_name: "狼人杀".into(),
                host_id: "p6".into(), host_name: "预言家".into(),
                players: vec![
                    crate::models::player::Player { id: "p6".into(), name: "预言家".into(), avatar: "🔮".into(), is_ready: true, is_host: true, is_online: true, joined_at: now.clone() },
                    crate::models::player::Player { id: "p7".into(), name: "女巫".into(), avatar: "🧙".into(), is_ready: true, is_host: false, is_online: true, joined_at: now.clone() },
                ],
                max_players: 12, is_private: true, password: Some("123".into()), status: crate::models::room::RoomStatus::Waiting,
                game_mode: "标准".into(), created_at: "10:15".into(), has_password: true,
            },
            Room {
                id: "r3".into(), name: "快节奏UNO".into(), game_id: "unocards".into(), game_name: "UNO牌".into(),
                host_id: "p8".into(), host_name: "卡牌大师".into(),
                players: vec![
                    crate::models::player::Player { id: "p8".into(), name: "卡牌大师".into(), avatar: "🃏".into(), is_ready: true, is_host: true, is_online: true, joined_at: now.clone() },
                ],
                max_players: 6, is_private: false, password: None, status: crate::models::room::RoomStatus::Playing,
                game_mode: "欢乐".into(), created_at: "10:00".into(), has_password: false,
            },
            Room {
                id: "r4".into(), name: "卡坦岛-休闲局".into(), game_id: "catan".into(), game_name: "卡坦岛".into(),
                host_id: "p9".into(), host_name: "拓荒者".into(),
                players: vec![
                    crate::models::player::Player { id: "p9".into(), name: "拓荒者".into(), avatar: "🏠".into(), is_ready: true, is_host: true, is_online: true, joined_at: now.clone() },
                    crate::models::player::Player { id: "p10".into(), name: "商人".into(), avatar: "💰".into(), is_ready: false, is_host: false, is_online: true, joined_at: now.clone() },
                ],
                max_players: 4, is_private: false, password: None, status: crate::models::room::RoomStatus::Waiting,
                game_mode: "标准".into(), created_at: "09:45".into(), has_password: false,
            },
            Room {
                id: "r5".into(), name: "璀璨宝石-快速对局".into(), game_id: "splendor".into(), game_name: "璀璨宝石".into(),
                host_id: "p11".into(), host_name: "宝石商人".into(),
                players: vec![
                    crate::models::player::Player { id: "p11".into(), name: "宝石商人".into(), avatar: "💎".into(), is_ready: true, is_host: true, is_online: true, joined_at: now.clone() },
                    crate::models::player::Player { id: "p12".into(), name: "收藏家".into(), avatar: "🏛️".into(), is_ready: true, is_host: false, is_online: true, joined_at: now.clone() },
                    crate::models::player::Player { id: "p13".into(), name: "策略家".into(), avatar: "🎯".into(), is_ready: true, is_host: false, is_online: true, joined_at: now.clone() },
                ],
                max_players: 4, is_private: false, password: None, status: crate::models::room::RoomStatus::Waiting,
                game_mode: "经典".into(), created_at: "09:30".into(), has_password: false,
            },
        ];

        AppState { rooms, chat_history: vec![], current_player_id: player_id, current_player_name: player_name }
    }

    pub fn get_home_stats(&self) -> HomeStats {
        let games = Game::preset_list();
        let total_online = 1523u32;
        let active_rooms = self.rooms.len() as u32;
        let games_in_play = self.rooms.iter().filter(|r| r.status == crate::models::room::RoomStatus::Playing).count() as u32;

        let mut hot_games = games.clone();
        hot_games.sort_by(|a, b| b.online_count.cmp(&a.online_count));

        let mut hot_rooms = self.rooms.clone();
        hot_rooms.sort_by(|a, b| {
            let a_count = a.players.len();
            let b_count = b.players.len();
            b_count.cmp(&a_count)
        });

        let online_friends = vec![
            OnlineFriend { id: "f1".into(), name: "桌游达人".into(), avatar: "👑".into(), status: "在线".into(), current_game: Some("阿瓦隆".into()) },
            OnlineFriend { id: "f2".into(), name: "预言家".into(), avatar: "🔮".into(), status: "在线".into(), current_game: Some("狼人杀".into()) },
            OnlineFriend { id: "f3".into(), name: "卡牌大师".into(), avatar: "🃏".into(), status: "游戏中".into(), current_game: Some("UNO牌".into()) },
            OnlineFriend { id: "f4".into(), name: "推理大师".into(), avatar: "🧠".into(), status: "在线".into(), current_game: None },
            OnlineFriend { id: "f5".into(), name: "拓荒者".into(), avatar: "🏠".into(), status: "空闲".into(), current_game: None },
        ];

        let announcements = vec![
            PlatformAnnouncement { id: "a1".into(), title: "新游戏上线".into(), content: "狼人杀新模式已上线，快来体验！".into(), time: "2小时前".into() },
            PlatformAnnouncement { id: "a2".into(), title: "服务器维护".into(), content: "今晚23:00-24:00服务器维护".into(), time: "5小时前".into() },
            PlatformAnnouncement { id: "a3".into(), title: "活动预告".into(), content: "周末双倍积分活动即将开启".into(), time: "1天前".into() },
        ];

        HomeStats {
            online_players: total_online,
            active_rooms,
            games_in_play,
            hot_games,
            hot_rooms,
            online_friends,
            announcements,
            user_profile: UserProfile {
                id: self.current_player_id.clone(),
                name: self.current_player_name.clone(),
                avatar: "🎮".into(),
                email: "player@cargonight.com".into(),
                total_games: 42,
                win_rate: 0.65,
                favorite_game: "阿瓦隆".into(),
                joined_date: "2026-01-15".into(),
                bio: "热爱桌游的旅行者".into(),
            },
        }
    }
}
