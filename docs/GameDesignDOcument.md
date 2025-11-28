Cyber-Football 2076

Platform: PC (Steam/Itch.io) Target Price: €4.99 Engine: Tauri (Rust Backend / React Frontend)

1. Core Gameplay Loop (The "Hook")
Instead of the traditional Scout -> Buy Player -> Train -> Play loop, we use:

Analyze: View your squad's biological limitations.

Modify: Spend budget on Cyberware Upgrades (Eyes, Legs, Neural, Lungs).

Simulate: Watch the match unfold in a retro-style text/2D visualizer.

Recover: Manage "Rejection Sickness" (The risk of too many upgrades).

2. The Features (MVP Scope)
Database: 8 Teams in one "Future League." No relegation/promotion for MVP. Just win the league.

Squad: Fixed 11 players per team. No transfers. You work with what you have.

Match Engine: "Premier Manager 98" style. A text log flashes fast (e.g., "Xavier activates Turbo-Legs...") with a simple progress bar or 2D dots moving.

The Economy: You earn "Credits" (¥) from winning matches. You spend ¥ on Upgrades.

3. The "Transhumanist" Upgrade System
This is your USP (Unique Selling Point). We replace the "Transfer Market" screen with the "Ripperdoc Clinic."

Slot 1: Ocular (Vision/Passing)

Tier 1: HUD Overlay (Standard +5 Vision)

Tier 2: Thermal Tracking (Can see through smoke/rain)

Tier 3: Precognition AI (Predicts pass paths 0.5s early)

Slot 2: Legs (Pace/Shooting)

Tier 1: Carbon Fiber Shin Replacements

Tier 2: Hydraulic Pistons (Chargeable kick power)

Tier 3: Anti-Grav Thrusters (Hover run - ignores terrain penalties)

Slot 3: Neural (Tactics/Composure)

Tier 1: Emotion Suppressor (Never gets nervous)

Tier 2: Hive Mind Link (Defenders move in perfect unison)

Tier 3: The "Kangal" Chip (Complete tactical autonomy)

Risk Mechanic: "Humanity Loss." If you upgrade a player too much, their "Rejection" stat goes up. If it hits 100%, they go "Cyber-Psychotic" and get a red card or attack a referee. You have to buy expensive "Immuno-Blockers" to keep them stable.

4. MVP Implementation Status (Nov 2025)
- ✅ Desktop shell booting with Tauri + React UI prototype (team select + locker room mood).
- ✅ Basic match stub in Rust returning text commentary.
- ⚠️ No season flow, finances, or injury/rejection tracking yet.
- ⚠️ Simulation logic still in React, which limits determinism, save files, and perf.
- ⚠️ UI is placeholder (single screen, no navigation, no responsive layout).

5. Next Phase Plan – Make It Playable

5.1 Move Core Sim To Rust
- Define canonical data models in Rust (`League`, `Team`, `Player`, `Augment`, `MatchState`). Expose them via Tauri commands returning serialized state snapshots.
- Build deterministic match engine in Rust: possession clock, stamina drain, upgrade modifiers, rejection spikes, cards, injuries. JS should only render events.
- Implement weekly loop in Rust (calendar tick, training cooldown, finances) so front-end just submits intents (`ApplyUpgrade`, `StartMatch`, `BuyMedkit`).

5.2 Gameplay Loop Features
- Season progression: 14-match double round-robin with league table, credits payout, championship screen.
- Upgrade economy: clinic UI hooked to backend, upgrade tiers gating on research level, rejection meds as consumables.
- Player conditions: morale, rejection %, injuries, fatigue shared across matches.
- Save/load: JSON save file written by Rust every week so players can resume careers.

5.3 UI/UX Overhaul Toward AAA Presentation
- Navigation framework (Home Hub) with tabs: Squad Lab, Clinic, Matchday, League Table, Data Archives.
- Consistent neon/cyberpunk art direction: typography, shader-like gradients, animated scanlines, responsive grid.
- Matchday presentation revamp: dual-pane (tactical map + event feed), audio stingers, highlight timelines, substitution controls.
- Accessibility: scalable fonts, colorblind palette toggle, controller shortcuts.

6. Immediate Value Adds (Sprint 1)
1. **Backend**: implement Rust structs & Tauri commands for `get_teams`, `get_players(team_id)`, `simulate_match(state, settings)`; move random generation entirely to Rust.
2. **State Persistence**: centralize game state in Rust and expose a `advance_week` command; JS only mirrors via hooks.
3. **UI Skeleton**: add React router with placeholder pages (Dashboard, Clinic, Matchday, Table) to prove navigation + layout.
4. **Clinic Prototype**: vertical slice where upgrading a limb updates stats + rejection meter in Rust and visually animates in UI.
5. **Playable Loop**: allow starting a season, playing at least one match, receiving credits, and spending them before next fixture.

7. Longer-Term Targets
- Procedural commentary packs and camera-angle mini viewer rendered via WebGPU/Canvas.
- Deeper scouting + youth academy once transfer systems unlock.
- Online leaderboards/async leagues once core single-player is rock solid.

Delivery Notes
- Prioritize Rust-first logic to ensure balance tuning and saves remain authoritative.
- Keep UI work modular so art team can reskin components without touching logic.
- Each sprint should ship a usable loop (team management → match → rewards) even if art is placeholder.