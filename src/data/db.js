import PLAYERS_DATA from './players.json'

export const POSITIONS = {
  GK: 'Goalkeeper',
  LB: 'Left Back',
  CB: 'Center Back',
  RB: 'Right Back',
  CDM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  CAM: 'Attacking Midfielder',
  LM: 'Left Midfielder',
  RM: 'Right Midfielder',
  LW: 'Left Winger',
  RW: 'Right Winger',
  ST: 'Striker'
}

const getPlayersForCountry = (country) => {
  const players = PLAYERS_DATA.players.filter(p => p.nation === country)
  if (players.length === 0) {
    // Fallback if no players found for country (shouldn't happen with full generation)
    return []
  }
  return players.map(p => ({
    id: p.id,
    name: p.displayName,
    position: p.position,
    rating: p.overall,
    attributes: p.attributes,
    archetype: getArchetype(p.position, p.attributes) // Helper to assign archetype
  }))
}

const getArchetype = (pos, attrs) => {
  if (pos === 'GK') return 'Reflex Stopper'
  if (pos === 'DEF') return attrs.pace > 80 ? 'Wing Back' : 'Stopper'
  if (pos === 'MID') return attrs.vision > 80 ? 'Playmaker' : 'Box-to-Box'
  if (pos === 'FW') return attrs.pace > 85 ? 'Speedster' : 'Finisher'
  return 'Utility'
}

export const TEAMS_DB = [
  // Group A
  { name: "Japan", country: "Japan", focus: "Speed/Reflexes", color: "#ff00ff" },
  { name: "Germany", country: "Germany", focus: "Tactical AI", color: "#44ff44" },
  { name: "Nigeria", country: "Nigeria", focus: "Bio-Hacking", color: "#ff8800" },
  { name: "Mexico", country: "Mexico", focus: "Flair/Agility", color: "#00aa00" },
  // Group B
  { name: "USA", country: "USA", focus: "Brute Strength", color: "#ff4444" },
  { name: "England", country: "England", focus: "Durability", color: "#4444ff" },
  { name: "Iran", country: "Iran", focus: "Counter-Attack", color: "#ffffff" },
  { name: "South Korea", country: "South Korea", focus: "Speed/Reflexes", color: "#ee3333" },
  // Group C
  { name: "Brazil", country: "Brazil", focus: "Flair/Agility", color: "#00ffff" },
  { name: "France", country: "France", focus: "Tactical AI", color: "#0055a4" },
  { name: "Saudi Arabia", country: "Saudi Arabia", focus: "Durability", color: "#006c35" },
  { name: "Poland", country: "Poland", focus: "Cold Efficiency", color: "#dc143c" },
  // Group D
  { name: "Argentina", country: "Argentina", focus: "Flair/Agility", color: "#75aadb" },
  { name: "Netherlands", country: "Netherlands", focus: "Tactical AI", color: "#ff6600" },
  { name: "Morocco", country: "Morocco", focus: "Speed/Reflexes", color: "#c1272d" },
  { name: "Australia", country: "Australia", focus: "Brute Strength", color: "#ffcc00" },
  // Group E
  { name: "Spain", country: "Spain", focus: "Possession", color: "#aa151b" },
  { name: "Canada", country: "Canada", focus: "Cold Efficiency", color: "#88ffff" },
  { name: "Senegal", country: "Senegal", focus: "Speed/Reflexes", color: "#00853f" },
  { name: "Serbia", country: "Serbia", focus: "Durability", color: "#c7363d" },
  // Group F
  { name: "China", country: "China", focus: "Hivemind Cohesion", color: "#ffff00" },
  { name: "Egypt", country: "Egypt", focus: "Tactical AI", color: "#c8102e" },
  { name: "Ireland", country: "Ireland", focus: "Fighting Spirit", color: "#169b62" },
  { name: "Ghana", country: "Ghana", focus: "Bio-Hacking", color: "#fcd116" },
  // Group G
  { name: "Russia", country: "Russia", focus: "Brute Strength", color: "#d52b1e" },
  { name: "Switzerland", country: "Switzerland", focus: "Cold Efficiency", color: "#ff0000" },
  { name: "Colombia", country: "Colombia", focus: "Counter-Attack", color: "#fcd116" },
  { name: "Tunisia", country: "Tunisia", focus: "Tactical AI", color: "#e70013" },
  // Group H
  { name: "India", country: "India", focus: "Hivemind Cohesion", color: "#ff9933" },
  { name: "Sweden", country: "Sweden", focus: "Cold Efficiency", color: "#006aa7" },
  { name: "Uruguay", country: "Uruguay", focus: "Durability", color: "#5cbfeb" },
  { name: "Cameroon", country: "Cameroon", focus: "Brute Strength", color: "#007a5e" },
].map(team => ({
  ...team,
  roster: getPlayersForCountry(team.country)
}))
