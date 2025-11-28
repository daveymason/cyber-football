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

const FIRST_NAMES = {
  Japan: ['Hiroto', 'Ren', 'Haruto', 'Sota', 'Yuto', 'Riku', 'Kaito', 'Takumi', 'Kenji', 'Daiki'],
  Germany: ['Lukas', 'Finn', 'Elias', 'Noah', 'Leon', 'Luca', 'Felix', 'Maximilian', 'Paul', 'Jonas'],
  Nigeria: ['Chinedu', 'Emeka', 'Tunde', 'Ade', 'Sola', 'Femi', 'Bolaji', 'Yusuf', 'Musa', 'Ibrahim'],
  Mexico: ['Santiago', 'Mateo', 'Sebastian', 'Leonardo', 'Matias', 'Emiliano', 'Diego', 'Daniel', 'Miguel', 'Jose'],
  USA: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'],
  England: ['Oliver', 'George', 'Harry', 'Noah', 'Jack', 'Leo', 'Arthur', 'Muhammad', 'Oscar', 'Charlie'],
  // ... generic fallback
  World: ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Taylor', 'Morgan', 'Jamie', 'Quinn', 'Avery']
}

const LAST_NAMES = {
  Japan: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'],
  Germany: ['Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'],
  Nigeria: ['Okafor', 'Okonkwo', 'Okeke', 'Okoro', 'Okoye', 'Okpara', 'Okoli', 'Okolo', 'Okorie', 'Okura'],
  Mexico: ['Garcia', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Rodriguez', 'Sanchez', 'Ramirez', 'Cruz'],
  USA: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
  England: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright'],
  World: ['Smith', 'Doe', 'White', 'Black', 'Green', 'Brown', 'Gray', 'Blue', 'Red', 'Orange']
}

const generateName = (country) => {
  const firsts = FIRST_NAMES[country] || FIRST_NAMES.World
  const lasts = LAST_NAMES[country] || LAST_NAMES.World
  return `${firsts[Math.floor(Math.random() * firsts.length)]} ${lasts[Math.floor(Math.random() * lasts.length)]}`
}

const generateRoster = (country, focus) => {
  const roster = []
  const positions = ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'ST', 'RW', 'GK', 'CB', 'CM', 'ST', 'LW']
  
  positions.forEach((pos, i) => {
    let rating = 75 + Math.floor(Math.random() * 15)
    // Boost rating based on focus?
    if (focus.includes('Tactical') && ['CM', 'CDM', 'CAM'].includes(pos)) rating += 3
    if (focus.includes('Speed') && ['LW', 'RW', 'LB', 'RB'].includes(pos)) rating += 3
    if (focus.includes('Strength') && ['CB', 'ST'].includes(pos)) rating += 3

    roster.push({
      id: `${country}-${pos}-${i}`,
      name: generateName(country),
      position: pos,
      rating: Math.min(99, rating),
      attributes: {
        pace: 70 + Math.floor(Math.random() * 29),
        shooting: 60 + Math.floor(Math.random() * 39),
        passing: 60 + Math.floor(Math.random() * 39),
        dribbling: 60 + Math.floor(Math.random() * 39),
        defending: 40 + Math.floor(Math.random() * 59),
        physical: 60 + Math.floor(Math.random() * 39)
      }
    })
  })
  return roster
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
  { name: "Portugal", country: "Portugal", focus: "Flair/Agility", color: "#046a38" },
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
  roster: generateRoster(team.country, team.focus)
}))
