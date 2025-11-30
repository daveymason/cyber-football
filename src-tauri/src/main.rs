#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rand::Rng;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Clone, Serialize)]
struct MatchEvent {
    minute: u32,
    message: String,
    is_goal: bool,
    score: (u8, u8),
}

#[derive(Clone, Deserialize, Serialize)]
struct Player {
    name: String,
    position: String,
    rating: u8,
}

#[derive(Clone, Deserialize, Serialize)]
struct Team {
    name: String,
    formation: String,
    rating: u8,
    players: Vec<Player>,
}

fn count_attackers(players: &Vec<Player>) -> u8 {
    let attackers = ["ST", "LW", "RW", "CF", "CAM"]
        .iter()
        .map(|p| players.iter().filter(|pl| pl.position == *p).count() as u8)
        .sum();
    attackers
}

#[tauri::command]
fn save_game(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("savegame.json");
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_game(app_handle: tauri::AppHandle) -> Result<String, String> {
    let path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("savegame.json");
    if !path.exists() {
        return Ok("".to_string());
    }
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn simulate_match(home: Team, away: Team, is_knockout: bool) -> Vec<MatchEvent> {
    let mut events: Vec<MatchEvent> = Vec::new();
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

    // compute base strengths from team rating (plus slight randomness)
    let mut home_strength = (home.rating as f64) + (rng.gen_range(-4.0..4.0));
    let away_strength = (away.rating as f64) + (rng.gen_range(-4.0..4.0));

    // Tactical Bonus Logic
    // Rock-Paper-Scissors style tactical advantage
    // 4-3-3 beats 5-3-2 (Overwhelms defense)
    // 5-3-2 beats 4-4-2 (Solid defense vs balanced)
    // 4-4-2 beats 3-5-2 (Wide coverage vs midfield overload)
    // 3-5-2 beats 4-3-3 (Midfield dominance vs spread out)
    // 3-4-3 beats 4-2-3-1 (Aggression vs Structure)
    // 4-2-3-1 beats 4-4-2 (Control vs Flat)
    
    let tactical_bonus = match (home.formation.as_str(), away.formation.as_str()) {
        ("4-3-3", "5-3-2") => 3.0,
        ("5-3-2", "4-4-2") => 3.0,
        ("4-4-2", "3-5-2") => 3.0,
        ("3-5-2", "4-3-3") => 3.0,
        ("3-4-3", "4-2-3-1") => 3.0,
        ("4-2-3-1", "4-4-2") => 3.0,
        
        // Inverse
        ("5-3-2", "4-3-3") => -3.0,
        ("4-4-2", "5-3-2") => -3.0,
        ("3-5-2", "4-4-2") => -3.0,
        ("4-3-3", "3-5-2") => -3.0,
        ("4-2-3-1", "3-4-3") => -3.0,
        ("4-4-2", "4-2-3-1") => -3.0,
        _ => 0.0,
    };
    
    home_strength += tactical_bonus;

    // attacker counts to bias goal probability
    let home_attackers = count_attackers(&home.players) as f64;
    let away_attackers = count_attackers(&away.players) as f64;

    for minute in 1..=90 {
        // event probability per minute
        if rng.gen_range(0..100) < 15 {
            // decide which team is on the action based on strength proportion
            let home_prob = home_strength / (home_strength + away_strength);
            let is_home = rng.gen_bool(home_prob.max(0.05).min(0.95));

            // pick a random player from that side's starting XI (players list)
            let acting_team = if is_home { &home } else { &away };
            let acting_players = &acting_team.players;
            let actor = if !acting_players.is_empty() {
                &acting_players[rng.gen_range(0..acting_players.len())]
            } else {
                // fallback dummy
                &Player { name: "Unknown".into(), position: "??".into(), rating: 70u8 }
            };

            // goal probability influenced by rating and attackers
            let base_goal_chance = 6.0;
            let rating_factor = (actor.rating as f64 - 75.0) / 2.0; // -? .. +?
            let attack_factor = if is_home {
                home_attackers * 1.0
            } else {
                away_attackers * 1.0
            };
            let mut goal_chance = base_goal_chance + rating_factor + attack_factor;
            if goal_chance < 1.0 { goal_chance = 1.0 }
            if goal_chance > 40.0 { goal_chance = 40.0 }

            if rng.gen_range(0.0..100.0) < goal_chance {
                // it's a goal
                if is_home {
                    score.0 += 1;
                } else {
                    score.1 += 1;
                }
                events.push(MatchEvent {
                    minute,
                    message: format!("⚡ GOAL! {} scores for {}!", actor.name, acting_team.name),
                    is_goal: true,
                    score,
                });
            } else {
                // non-goal event with an action verb
                let action = actions[rng.gen_range(0..actions.len())];
                events.push(MatchEvent {
                    minute,
                    message: format!("{} {}...", acting_team.name, action),
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

    // Penalty Shootout Logic
    if is_knockout && score.0 == score.1 {
        events.push(MatchEvent {
            minute: 120,
            message: "Full Time ended in a draw. Proceeding to Penalty Shootout!".to_string(),
            is_goal: false,
            score,
        });

        // Simple coin flip for winner for now, but we could simulate shots
        let home_wins_pens = rng.gen_bool(0.5);
        
        if home_wins_pens {
            score.0 += 1;
            events.push(MatchEvent {
                minute: 120,
                message: format!("{} wins on penalties!", home.name),
                is_goal: true,
                score,
            });
        } else {
            score.1 += 1;
            events.push(MatchEvent {
                minute: 120,
                message: format!("{} wins on penalties!", away.name),
                is_goal: true,
                score,
            });
        }
    }

    events
}

#[tauri::command]
fn exit_app(app_handle: tauri::AppHandle) {
    app_handle.exit(0);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![simulate_match, save_game, load_game, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
