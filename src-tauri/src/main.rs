#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rand::Rng;
use serde::Serialize;

#[derive(Clone, Serialize)]
struct MatchEvent {
    minute: u32,
    message: String,
    is_goal: bool,
    score: (u8, u8),
}

#[tauri::command]
fn simulate_match(home_team: String, away_team: String) -> Vec<MatchEvent> {
    let mut events = Vec::new();
    let mut score = (0u8, 0u8);
    let mut rng = rand::thread_rng();

    let actions = [
        "attempts a neural-link pass",
        "charges down the flank with hydraulic legs",
        "intercepts with predictive AI",
        "launches a plasma shot",
        "executes a chrome-plated tackle",
        "weaves through defenders",
        "activates overdrive mode",
        "uploads tactical data",
    ];

    for minute in 1..=90 {
        if rng.gen_range(0..100) < 15 {
            let event_type = rng.gen_range(0..100);
            let is_home = rng.gen_bool(0.5);
            let team = if is_home { &home_team } else { &away_team };

            if event_type < 8 {
                if is_home {
                    score.0 += 1;
                } else {
                    score.1 += 1;
                }
                events.push(MatchEvent {
                    minute,
                    message: format!("⚡ GOAL! Cyber-Striker scores for {}!", team),
                    is_goal: true,
                    score,
                });
            } else {
                let action = actions[rng.gen_range(0..actions.len())];
                events.push(MatchEvent {
                    minute,
                    message: format!("{} {}...", team, action),
                    is_goal: false,
                    score,
                });
            }
        }
    }

    if events.is_empty() {
        events.push(MatchEvent {
            minute: 45,
            message: "A tense defensive battle...".to_string(),
            is_goal: false,
            score,
        });
    }

    events
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![simulate_match])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
