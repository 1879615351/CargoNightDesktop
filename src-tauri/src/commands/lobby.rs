use crate::models::room::{Room, CreateRoomPayload, RoomFilter, RoomStatus};
use crate::state::app_state::AppState;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::Local;

#[tauri::command]
pub async fn get_lobby_rooms(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    game_type: Option<String>,
    filter: Option<RoomFilter>,
) -> Result<Vec<Room>, String> {
    let app = state.lock().await;
    let mut rooms = app.rooms.clone();

    if let Some(gt) = game_type {
        rooms.retain(|r| r.game_id == gt);
    }

    if let Some(f) = filter {
        if let Some(kw) = f.keyword {
            let kw = kw.to_lowercase();
            rooms.retain(|r| r.name.to_lowercase().contains(&kw) || r.host_name.to_lowercase().contains(&kw));
        }
        if let Some(status) = f.status {
            rooms.retain(|r| match status.as_str() {
                "waiting" => r.status == RoomStatus::Waiting,
                "playing" => r.status == RoomStatus::Playing,
                _ => true,
            });
        }
        if let Some(mode) = f.game_mode {
            rooms.retain(|r| r.game_mode == mode);
        }
    }

    Ok(rooms)
}

#[tauri::command]
pub async fn create_room(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    payload: CreateRoomPayload,
) -> Result<Room, String> {
    let mut app = state.lock().await;
    let now = Local::now().format("%H:%M").to_string();
    let has_password = payload.password.is_some();

    let room = Room {
        id: Uuid::new_v4().to_string(),
        name: payload.name,
        game_id: payload.game_id,
        game_name: payload.game_name,
        host_id: app.current_player_id.clone(),
        host_name: app.current_player_name.clone(),
        players: vec![crate::models::player::Player {
            id: app.current_player_id.clone(),
            name: app.current_player_name.clone(),
            avatar: "🎮".into(),
            is_ready: true,
            is_host: true,
            is_online: true,
            joined_at: now.clone(),
        }],
        max_players: payload.max_players,
        is_private: payload.is_private,
        password: payload.password,
        status: RoomStatus::Waiting,
        game_mode: payload.game_mode,
        created_at: now,
        has_password,
    };

    app.rooms.push(room.clone());
    Ok(room)
}
