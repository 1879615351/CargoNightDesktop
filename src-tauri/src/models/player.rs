use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: String,
    pub name: String,
    pub avatar: String,
    pub is_ready: bool,
    pub is_host: bool,
    pub is_online: bool,
    pub joined_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: String,
    pub name: String,
    pub avatar: String,
    pub email: String,
    pub total_games: u32,
    pub win_rate: f64,
    pub favorite_game: String,
    pub joined_date: String,
    pub bio: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnlineFriend {
    pub id: String,
    pub name: String,
    pub avatar: String,
    pub status: String,
    pub current_game: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformAnnouncement {
    pub id: String,
    pub title: String,
    pub content: String,
    pub time: String,
}
