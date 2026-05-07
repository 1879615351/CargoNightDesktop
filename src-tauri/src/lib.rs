mod commands;
mod models;
mod state;

use state::app_state::AppState;
use commands::{home::*, games::*, lobby::*, room::*, chat::*};
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg(target_os = "android")]
#[tauri::mobile_entry_point]
fn android_main() {
    run()
}

pub fn run() {
    let app_state = Arc::new(Mutex::new(AppState::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_home_stats,
            get_game_list,
            get_lobby_rooms,
            create_room,
            join_room,
            leave_room,
            toggle_ready,
            send_chat,
            start_game,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
