use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn simulate_round(state_json: &str) -> String {
    let mut state: CareerState = serde_json::from_str(state_json).unwrap();
    if state.active_fixture_id.is_some() {
        return serde_json::to_string(&state).unwrap();
    }

    let day = state.calendar_day;
    let user_team = state.user_team.name.clone();

    for fixture in state.fixtures.iter_mut() {
        if fixture.day != day || fixture.status != "pending" {
            continue;
        }
        if fixture.home == user_team || fixture.away == user_team {
            continue;
        }
        let score = roll_score(
            &fixture.home,
            &fixture.away,
            &state.fatigue,
            &state.focus_weights,
        );
        fixture.score = [score.home, score.away];
        fixture.status = "played".into();
        record_result(&mut state, fixture, score);
    }

    state.calendar_day += 1;
    recover_fatigue(&mut state.fatigue);
    tick_injuries(&mut state.injuries);
    serde_json::to_string(&state).unwrap()
}

fn roll_score(
    home: &str,
    away: &str,
    fatigue: &HashMap<String, f32>,
    focus_weights: &HashMap<String, f32>,
) -> Score {
    let mut rng = rand::thread_rng();
    let home_bias = focus_weights.get(home).cloned().unwrap_or(1.0);
    let away_bias = focus_weights.get(away).cloned().unwrap_or(1.0);
    let home_fatigue = fatigue.get(home).cloned().unwrap_or(0.0) / 100.0;
    let away_fatigue = fatigue.get(away).cloned().unwrap_or(0.0) / 100.0;

    let raw_home = (rng.gen_range(0.0..2.5) + home_bias - home_fatigue) * 1.2;
    let raw_away = (rng.gen_range(0.0..2.3) + away_bias - away_fatigue) * 1.1;

    Score {
        home: raw_home.max(0.0).round() as i32,
        away: raw_away.max(0.0).round() as i32,
    }
}

fn record_result(state: &mut CareerState, fixture: &Fixture, score: Score) {
    if let Some(home_row) = state.standings.get_mut(&fixture.home) {
        apply_result(home_row, score.home, score.away);
    }
    if let Some(away_row) = state.standings.get_mut(&fixture.away) {
        apply_result(away_row, score.away, score.home);
    }
    bump_fatigue(&mut state.fatigue, &fixture.home, 12.0);
    bump_fatigue(&mut state.fatigue, &fixture.away, 12.0);

    if rand::random::<f32>() < 0.18 {
        let team = if rand::random::<bool>() {
            fixture.home.clone()
        } else {
            fixture.away.clone()
        };
        state.injuries.push(Injury {
            id: format!("{}-{}-{}", fixture.id, team, state.injuries.len()),
            team,
            player: "Neon Striker".into(),
            days: 2 + rand::thread_rng().gen_range(0..3),
        });
    }

    state.history.push(HistoryEntry {
        id: fixture.id.clone(),
        day: state.calendar_day,
        home: fixture.home.clone(),
        away: fixture.away.clone(),
        score: [score.home, score.away],
    });
    if state.history.len() > 64 {
        state.history.remove(0);
    }
}

fn apply_result(row: &mut Standing, goals_for: i32, goals_against: i32) {
    row.played += 1;
    row.goals_for += goals_for;
    row.goals_against += goals_against;
    row.goal_diff = row.goals_for - row.goals_against;
    if goals_for > goals_against {
        row.won += 1;
        row.points += 3;
    } else if goals_for == goals_against {
        row.drawn += 1;
        row.points += 1;
    } else {
        row.lost += 1;
    }
}

fn recover_fatigue(fatigue: &mut HashMap<String, f32>) {
    for value in fatigue.values_mut() {
        *value = (*value - 6.0).clamp(0.0, 100.0);
    }
}

fn bump_fatigue(fatigue: &mut HashMap<String, f32>, team: &str, delta: f32) {
    let entry = fatigue.entry(team.to_string()).or_insert(0.0);
    *entry = (*entry + delta).clamp(0.0, 100.0);
}

fn tick_injuries(injuries: &mut Vec<Injury>) {
    injuries.retain_mut(|injury| {
        injury.days = injury.days.saturating_sub(1);
        injury.days > 0
    });
}

#[derive(Serialize, Deserialize, Clone)]
struct CareerState {
    calendar_day: u32,
    fixtures: Vec<Fixture>,
    user_team: TeamStub,
    standings: HashMap<String, Standing>,
    #[serde(default)]
    fatigue: HashMap<String, f32>,
    #[serde(default)]
    injuries: Vec<Injury>,
    #[serde(default)]
    history: Vec<HistoryEntry>,
    #[serde(default)]
    active_fixture_id: Option<String>,
    #[serde(default)]
    focus_weights: HashMap<String, f32>,
}

#[derive(Serialize, Deserialize, Clone)]
struct TeamStub {
    name: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Fixture {
    id: String,
    day: u32,
    home: String,
    away: String,
    status: String,
    score: [i32; 2],
}

#[derive(Serialize, Deserialize, Clone)]
struct Standing {
    team: String,
    played: i32,
    won: i32,
    drawn: i32,
    lost: i32,
    goals_for: i32,
    goals_against: i32,
    goal_diff: i32,
    points: i32,
}

#[derive(Serialize, Deserialize, Clone)]
struct Injury {
    id: String,
    team: String,
    player: String,
    days: i32,
}

#[derive(Serialize, Deserialize, Clone)]
struct HistoryEntry {
    id: String,
    day: u32,
    home: String,
    away: String,
    score: [i32; 2],
}

struct Score {
    home: i32,
    away: i32,
}
