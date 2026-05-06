use crate::models::chat::ChatMessage;
use crate::state::app_state::AppState;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::Local;

#[derive(Debug, serde::Deserialize)]
pub struct ChatPayload {
    pub room_id: String,
    pub content: String,
}

#[tauri::command]
pub async fn send_chat(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    payload: ChatPayload,
) -> Result<Vec<ChatMessage>, String> {
    let mut app = state.lock().await;
    let room_id = payload.room_id.clone();
    let content = payload.content;

    if !app.rooms.iter().any(|r| r.id == room_id) {
        return Err("Room not found".into());
    }

    let msg = ChatMessage {
        id: Uuid::new_v4().to_string(),
        room_id: room_id.clone(),
        sender_id: app.current_player_id.clone(),
        sender_name: app.current_player_name.clone(),
        content,
        timestamp: Local::now().format("%H:%M:%S").to_string(),
        is_system: false,
    };

    app.chat_history.push(msg);

    let room_msgs: Vec<ChatMessage> = app.chat_history
        .iter()
        .filter(|m| m.room_id == room_id)
        .cloned()
        .collect();

    Ok(room_msgs)
}
