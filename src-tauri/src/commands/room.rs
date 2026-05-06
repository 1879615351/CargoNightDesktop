use crate::models::player::Player;
use crate::models::room::{Room, RoomStatus};
use crate::models::chat::ChatMessage;
use crate::state::app_state::AppState;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::Local;

#[tauri::command]
pub async fn join_room(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    room_id: String,
) -> Result<Room, String> {
    let mut app = state.lock().await;
    let player_id = app.current_player_id.clone();
    let player_name = app.current_player_name.clone();

    let room_idx = app.rooms.iter().position(|r| r.id == room_id)
        .ok_or("Room not found")?;

    let room = &mut app.rooms[room_idx];

    if room.players.len() as u32 >= room.max_players {
        return Err("Room is full".into());
    }

    if room.players.iter().any(|p| p.id == player_id) {
        return Err("Already in room".into());
    }

    let now = Local::now().format("%H:%M").to_string();
    room.players.push(Player {
        id: player_id,
        name: player_name.clone(),
        avatar: "🎮".into(),
        is_ready: false,
        is_host: false,
        is_online: true,
        joined_at: now,
    });

    let sys_msg = ChatMessage {
        id: Uuid::new_v4().to_string(),
        room_id: room_id.clone(),
        sender_id: "system".into(),
        sender_name: "系统".into(),
        content: format!("{} 加入了房间", player_name),
        timestamp: Local::now().format("%H:%M:%S").to_string(),
        is_system: true,
    };
    app.chat_history.push(sys_msg);

    Ok(app.rooms[room_idx].clone())
}

#[tauri::command]
pub async fn leave_room(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    room_id: String,
) -> Result<bool, String> {
    let mut app = state.lock().await;
    let player_id = app.current_player_id.clone();

    let room_idx = app.rooms.iter().position(|r| r.id == room_id)
        .ok_or("Room not found")?;

    let player_name = app.rooms[room_idx].players.iter()
        .find(|p| p.id == player_id)
        .map(|p| p.name.clone())
        .unwrap_or_default();

    let was_host = app.rooms[room_idx].host_id == player_id;

    app.rooms[room_idx].players.retain(|p| p.id != player_id);

    if was_host {
        if let Some(new_host) = app.rooms[room_idx].players.first().cloned() {
            app.rooms[room_idx].host_id = new_host.id.clone();
            app.rooms[room_idx].host_name = new_host.name.clone();
            if let Some(new_host_player) = app.rooms[room_idx].players.first_mut() {
                new_host_player.is_ready = true;
                new_host_player.is_host = true;
            }
        } else {
            app.rooms.remove(room_idx);
        }
    }

    if !player_name.is_empty() {
        let sys_msg = ChatMessage {
            id: Uuid::new_v4().to_string(),
            room_id: room_id.clone(),
            sender_id: "system".into(),
            sender_name: "系统".into(),
            content: format!("{} 离开了房间", player_name),
            timestamp: Local::now().format("%H:%M:%S").to_string(),
            is_system: true,
        };
        app.chat_history.push(sys_msg);
    }

    Ok(true)
}

#[tauri::command]
pub async fn toggle_ready(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    room_id: String,
) -> Result<Room, String> {
    let mut app = state.lock().await;
    let player_id = app.current_player_id.clone();

    let room_idx = app.rooms.iter().position(|r| r.id == room_id)
        .ok_or("Room not found")?;

    let player = app.rooms[room_idx].players.iter_mut()
        .find(|p| p.id == player_id)
        .ok_or("Player not in room")?;

    player.is_ready = !player.is_ready;
    let ready_status = player.is_ready;
    let player_name = player.name.clone();

    let sys_msg = ChatMessage {
        id: Uuid::new_v4().to_string(),
        room_id: room_id.clone(),
        sender_id: "system".into(),
        sender_name: "系统".into(),
        content: format!("{} {}", player_name, if ready_status { "已准备" } else { "取消准备" }),
        timestamp: Local::now().format("%H:%M:%S").to_string(),
        is_system: true,
    };
    app.chat_history.push(sys_msg);

    Ok(app.rooms[room_idx].clone())
}

#[tauri::command]
pub async fn start_game(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    room_id: String,
) -> Result<Room, String> {
    let mut app = state.lock().await;
    let player_id = app.current_player_id.clone();

    let room_idx = app.rooms.iter().position(|r| r.id == room_id)
        .ok_or("Room not found")?;

    if app.rooms[room_idx].host_id != player_id {
        return Err("Only the host can start the game".into());
    }

    let total = app.rooms[room_idx].players.len() as u32;
    let ready = app.rooms[room_idx].players.iter().filter(|p| p.is_ready).count() as u32;

    if ready < total {
        return Err(format!("Not all players are ready ({}/{})", ready, total));
    }

    if total < 2 {
        return Err("Need at least 2 players".into());
    }

    app.rooms[room_idx].status = RoomStatus::Playing;

    let sys_msg = ChatMessage {
        id: Uuid::new_v4().to_string(),
        room_id: room_id.clone(),
        sender_id: "system".into(),
        sender_name: "系统".into(),
        content: "游戏开始！".into(),
        timestamp: Local::now().format("%H:%M:%S").to_string(),
        is_system: true,
    };
    app.chat_history.push(sys_msg);

    Ok(app.rooms[room_idx].clone())
}
