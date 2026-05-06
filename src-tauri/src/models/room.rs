use serde::{Deserialize, Serialize};
use super::player::Player;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    pub id: String,
    pub name: String,
    pub game_id: String,
    pub game_name: String,
    pub host_id: String,
    pub host_name: String,
    pub players: Vec<Player>,
    pub max_players: u32,
    pub is_private: bool,
    pub password: Option<String>,
    pub status: RoomStatus,
    pub game_mode: String,
    pub created_at: String,
    pub has_password: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RoomStatus {
    Waiting,
    Playing,
    Finished,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRoomPayload {
    pub name: String,
    pub game_id: String,
    pub game_name: String,
    pub max_players: u32,
    pub is_private: bool,
    pub password: Option<String>,
    pub game_mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomFilter {
    pub keyword: Option<String>,
    pub status: Option<String>,
    pub game_mode: Option<String>,
}
