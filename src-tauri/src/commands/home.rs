use crate::state::app_state::HomeStats;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::state::app_state::AppState;

#[tauri::command]
pub async fn get_home_stats(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
) -> Result<HomeStats, String> {
    let app = state.lock().await;
    Ok(app.get_home_stats())
}
