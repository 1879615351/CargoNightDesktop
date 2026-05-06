use crate::models::game::Game;

#[tauri::command]
pub async fn get_game_list() -> Result<Vec<Game>, String> {
    Ok(Game::preset_list())
}
