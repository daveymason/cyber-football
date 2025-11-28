const TEAMS = [
  { name: "Neo-Tokyo United", country: "Japan", focus: "Speed/Reflexes", color: "#ff00ff" },
  { name: "New York Titans", country: "USA", focus: "Brute Strength", color: "#ff4444" },
  { name: "Berlin Borg", country: "Germany", focus: "Tactical AI", color: "#44ff44" },
  { name: "London Ironclads", country: "UK", focus: "Durability", color: "#4444ff" },
  { name: "Shenzhen Synths", country: "China", focus: "Hivemind Cohesion", color: "#ffff00" },
  { name: "Sao Paulo Cyber-Saints", country: "Brazil", focus: "Flair/Agility", color: "#00ffff" },
  { name: "Lagos Uplink", country: "Nigeria", focus: "Bio-Hacking", color: "#ff8800" },
  { name: "Toronto Frost", country: "Canada", focus: "Cold Efficiency", color: "#88ffff" },
]

const DEFAULT_SETTINGS = {
  presentation: 'hybrid',
  simSpeed: 2,
  anomalies: true,
  aiDifficulty: 'standard',
  aggressionBias: 50,
  injurySimulation: true,
  masterVolume: 70,
  fxVolume: 65,
  fontScale: '1',
  palette: 'neon'
}

const FOCUS_WEIGHTS = {
  'Speed/Reflexes': 1.15,
  'Brute Strength': 1.1,
  'Tactical AI': 1.2,
  'Durability': 1.05,
  'Hivemind Cohesion': 1.18,
  'Flair/Agility': 1.12,
  'Bio-Hacking': 1.08,
  'Cold Efficiency': 1.14,
  'Counter-Attack': 1.13,
  'Possession': 1.16,
}

export const bootCareerState = (teams, selectedTeam) => {
  const groups = assignGroups(teams)
  const userGroup = findUserGroup(groups, selectedTeam.name)
  
  return {
    phase: 'group', // 'group' | 'knockout'
    matchday: 1,
    userTeam: selectedTeam,
    groups,
    userGroup,
    groupFixtures: generateGroupFixtures(groups),
    knockoutBracket: null,
    standings: buildGroupStandings(groups),
    fatigue: buildFatigue(teams),
    injuries: [],
    history: [],
    pendingResults: [],
    activeFixtureId: null,
    teamsLookup: mapTeams(teams),
    tournamentComplete: false,
    userEliminated: false,
    knockoutRound: null,
  }
}

export const getNextUserFixture = (state) => {
  if (!state || !state.userTeam) return null
  
  if (state.phase === 'group') {
    return state.groupFixtures.find(f => 
      f.matchday === state.matchday &&
      f.status === 'pending' &&
      (f.home === state.userTeam.name || f.away === state.userTeam.name)
    ) || null
  }
  
  if (state.phase === 'knockout' && state.knockoutBracket) {
    return state.knockoutBracket.find(f =>
      f.status === 'pending' &&
      (f.home === state.userTeam.name || f.away === state.userTeam.name)
    ) || null
  }
  
  return null
}

export const getGroupStandings = (state, groupName) => {
  if (!state.standings || !state.standings[groupName]) return []
  return [...state.standings[groupName]].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
    return b.goalsFor - a.goalsFor
  })
}

export const getAllGroupStandings = (state) => {
  const result = {}
  if (state.groups) {
    Object.keys(state.groups).forEach(groupName => {
      result[groupName] = getGroupStandings(state, groupName)
    })
  }
  return result
}

export const getMatchdayFixtures = (state, matchday) => {
  if (state.phase === 'group') {
    return state.groupFixtures.filter(f => f.matchday === matchday)
  }
  return []
}

export const ingestPlayedMatch = (state, result = {}) => {
  if (!state) return state
  
  const next = cloneState(state)
  const fixtureId = result.fixtureId ?? next.activeFixtureId
  
  let fixture
  if (next.phase === 'group') {
    fixture = next.groupFixtures.find(f => f.id === fixtureId)
  } else if (next.phase === 'knockout') {
    fixture = next.knockoutBracket?.find(f => f.id === fixtureId)
  }
  
  if (!fixture) return state
  
  const score = normalizeScore(result.score)
  fixture.status = 'played'
  fixture.score = score
  
  if (next.phase === 'group') {
    updateGroupStandings(next, fixture.group, fixture.home, fixture.away, score)
  }
  
  next.history.push({
    id: fixture.id,
    phase: next.phase,
    matchday: next.matchday,
    home: fixture.home,
    away: fixture.away,
    score,
    userControlled: true,
  })
  
  bumpFatigue(next, fixture.home, 15)
  bumpFatigue(next, fixture.away, 15)
  
  if (result.injuries) {
    result.injuries.forEach(inj => next.injuries.push(inj))
  }
  
  next.activeFixtureId = null
  
  return simulateMatchdayOtherGames(next)
}

export const simulateMatchdayOtherGames = (state) => {
  if (!state) return state
  
  const next = cloneState(state)
  const pendingResults = []
  
  if (next.phase === 'group' && next.groupFixtures) {
    const matchdayFixtures = next.groupFixtures.filter(f => 
      f.matchday === next.matchday && 
      f.status === 'pending' &&
      f.home !== next.userTeam.name && 
      f.away !== next.userTeam.name
    )
    
    matchdayFixtures.forEach(fixture => {
      const result = simulateMatch(next, fixture.home, fixture.away)
      fixture.status = 'played'
      fixture.score = result.score
      
      updateGroupStandings(next, fixture.group, fixture.home, fixture.away, result.score)
      
      pendingResults.push({
        ...fixture,
        score: result.score,
      })
      
      result.injuries.forEach(inj => next.injuries.push(inj))
    })
  } else if (next.phase === 'knockout' && next.knockoutBracket) {
    const roundFixtures = next.knockoutBracket.filter(f => 
      f.round === next.knockoutRound &&
      f.status === 'pending' &&
      f.home !== next.userTeam.name && 
      f.away !== next.userTeam.name &&
      f.home !== 'TBD' && 
      f.away !== 'TBD'
    )

    roundFixtures.forEach(fixture => {
      const result = simulateMatch(next, fixture.home, fixture.away)
      fixture.status = 'played'
      fixture.score = result.score
      
      pendingResults.push({
        ...fixture,
        score: result.score,
      })
      
      result.injuries.forEach(inj => next.injuries.push(inj))
    })
  }
  
  next.pendingResults = pendingResults
  return next
}

export const advanceToNextMatchday = (state) => {
  if (!state) return state
  
  const next = cloneState(state)
  
  next.pendingResults = []
  
  Object.keys(next.fatigue).forEach(team => {
    next.fatigue[team] = Math.max(0, next.fatigue[team] - 8)
  })
  
  next.injuries = next.injuries
    .map(inj => ({ ...inj, days: inj.days - 1 }))
    .filter(inj => inj.days > 0)
  
  if (next.phase === 'group') {
    if (next.matchday < 3) {
      next.matchday += 1
    } else {
      const qualified = determineQualifiedTeams(next)
      
      if (!qualified.some(q => q.team === next.userTeam.name)) {
        next.userEliminated = true
        next.tournamentComplete = true
      } else {
        next.phase = 'knockout'
        next.knockoutBracket = generateKnockoutBracket(qualified)
        next.knockoutRound = 'R16'
      }
    }
  } else if (next.phase === 'knockout') {
    const userKnockoutFixture = next.knockoutBracket.find(f =>
      f.round === next.knockoutRound &&
      (f.home === next.userTeam.name || f.away === next.userTeam.name)
    )
    
    if (userKnockoutFixture && userKnockoutFixture.status === 'played') {
      const userIsHome = userKnockoutFixture.home === next.userTeam.name
      const userGoals = userIsHome ? userKnockoutFixture.score[0] : userKnockoutFixture.score[1]
      const oppGoals = userIsHome ? userKnockoutFixture.score[1] : userKnockoutFixture.score[0]
      
      if (userGoals < oppGoals) {
        next.userEliminated = true
      }
    }
    
    const roundOrder = ['R16', 'QF', 'SF', 'F']
    const currentIdx = roundOrder.indexOf(next.knockoutRound)
    
    if (currentIdx < roundOrder.length - 1 && !next.userEliminated) {
      next.knockoutRound = roundOrder[currentIdx + 1]
      advanceKnockoutRound(next)
    } else {
      next.tournamentComplete = true
    }
  }
  
  return next
}

// Alias for compatibility
export const advanceCareerDay = advanceToNextMatchday

// Internal Helpers

const assignGroups = (teams) => {
  const shuffled = [...teams].sort(() => Math.random() - 0.5)
  const groups = {}
  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  
  groupNames.forEach((name, idx) => {
    groups[name] = shuffled.slice(idx * 4, idx * 4 + 4).map(t => t.name)
  })
  
  return groups
}

const findUserGroup = (groups, userTeamName) => {
  for (const [groupName, teamNames] of Object.entries(groups)) {
    if (teamNames.includes(userTeamName)) return groupName
  }
  return 'A'
}

const generateGroupFixtures = (groups) => {
  const fixtures = []
  
  Object.entries(groups).forEach(([groupName, teamNames]) => {
    // Matchday 1: 1v2, 3v4
    fixtures.push({
      id: `group-${groupName}-md1-1`,
      group: groupName,
      matchday: 1,
      home: teamNames[0],
      away: teamNames[1],
      status: 'pending',
      score: null,
    })
    fixtures.push({
      id: `group-${groupName}-md1-2`,
      group: groupName,
      matchday: 1,
      home: teamNames[2],
      away: teamNames[3],
      status: 'pending',
      score: null,
    })
    
    // Matchday 2: 1v3, 2v4
    fixtures.push({
      id: `group-${groupName}-md2-1`,
      group: groupName,
      matchday: 2,
      home: teamNames[0],
      away: teamNames[2],
      status: 'pending',
      score: null,
    })
    fixtures.push({
      id: `group-${groupName}-md2-2`,
      group: groupName,
      matchday: 2,
      home: teamNames[1],
      away: teamNames[3],
      status: 'pending',
      score: null,
    })
    
    // Matchday 3: 1v4, 2v3
    fixtures.push({
      id: `group-${groupName}-md3-1`,
      group: groupName,
      matchday: 3,
      home: teamNames[0],
      away: teamNames[3],
      status: 'pending',
      score: null,
    })
    fixtures.push({
      id: `group-${groupName}-md3-2`,
      group: groupName,
      matchday: 3,
      home: teamNames[1],
      away: teamNames[2],
      status: 'pending',
      score: null,
    })
  })
  
  return fixtures
}

const buildGroupStandings = (groups) => {
  const standings = {}
  
  Object.entries(groups).forEach(([groupName, teamNames]) => {
    standings[groupName] = teamNames.map(name => ({
      team: name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    }))
  })
  
  return standings
}

const simulateMatch = (state, home, away) => {
  const homeBias = focusWeight(state, home)
  const awayBias = focusWeight(state, away)
  const fatigueHome = (state.fatigue[home] ?? 0) / 100
  const fatigueAway = (state.fatigue[away] ?? 0) / 100
  
  const homeScore = Math.max(0, Math.round((Math.random() * 2.5 + homeBias - fatigueHome) * 1.2))
  const awayScore = Math.max(0, Math.round((Math.random() * 2.3 + awayBias - fatigueAway) * 1.1))
  
  const injuries = []
  if (Math.random() < 0.15) {
    const injuredTeam = Math.random() > 0.5 ? home : away
    injuries.push({
      id: `injury-${Date.now()}-${Math.random()}`,
      team: injuredTeam,
      player: generateCodename(),
      days: 1 + Math.floor(Math.random() * 2),
    })
  }
  
  return { score: [homeScore, awayScore], injuries }
}

const updateGroupStandings = (state, groupName, home, away, score) => {
  const group = state.standings[groupName]
  if (!group) return
  
  const homeRow = group.find(r => r.team === home)
  const awayRow = group.find(r => r.team === away)
  
  if (homeRow) applyResult(homeRow, score[0], score[1])
  if (awayRow) applyResult(awayRow, score[1], score[0])
}

const applyResult = (row, goalsFor, goalsAgainst) => {
  row.played += 1
  row.goalsFor += goalsFor
  row.goalsAgainst += goalsAgainst
  row.goalDiff = row.goalsFor - row.goalsAgainst
  if (goalsFor > goalsAgainst) {
    row.won += 1
    row.points += 3
  } else if (goalsFor === goalsAgainst) {
    row.drawn += 1
    row.points += 1
  } else {
    row.lost += 1
  }
}

const buildFatigue = (teams) => teams.reduce((acc, team) => {
  acc[team.name] = 5 + Math.random() * 10
  return acc
}, {})

const mapTeams = (teams) => teams.reduce((acc, team) => {
  acc[team.name] = team
  return acc
}, {})

const bumpFatigue = (state, team, delta) => {
  const current = state.fatigue[team] ?? 0
  state.fatigue[team] = Math.max(0, Math.min(100, current + delta))
}

const focusWeight = (state, teamName) => {
  const focus = state.teamsLookup?.[teamName]?.focus ?? ''
  return FOCUS_WEIGHTS[focus] ?? 1
}

const cloneState = (state) => JSON.parse(JSON.stringify(state))

const normalizeScore = (score) => {
  if (!Array.isArray(score)) return [0, 0]
  return [Number(score[0] ?? 0), Number(score[1] ?? 0)]
}

const generateCodename = () => {
  const adjectives = ['Quantum', 'Neon', 'Chrome', 'Echo', 'Plasma', 'Cyber', 'Nova', 'Volt']
  const nouns = ['Striker', 'Runner', 'Shield', 'Ghost', 'Blade', 'Spark', 'Storm', 'Wire']
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
}

const determineQualifiedTeams = (state) => {
  const qualified = []
  
  Object.keys(state.groups).forEach(groupName => {
    const sorted = getGroupStandings(state, groupName)
    if (sorted[0]) qualified.push({ team: sorted[0].team, position: '1st', group: groupName })
    if (sorted[1]) qualified.push({ team: sorted[1].team, position: '2nd', group: groupName })
  })
  
  return qualified
}

const generateKnockoutBracket = (qualified) => {
  const matchups = [
    ['A', '1st', 'B', '2nd'],
    ['C', '1st', 'D', '2nd'],
    ['E', '1st', 'F', '2nd'],
    ['G', '1st', 'H', '2nd'],
    ['B', '1st', 'A', '2nd'],
    ['D', '1st', 'C', '2nd'],
    ['F', '1st', 'E', '2nd'],
    ['H', '1st', 'G', '2nd'],
  ]
  
  const fixtures = matchups.map((matchup, idx) => {
    const home = qualified.find(q => q.group === matchup[0] && q.position === matchup[1])
    const away = qualified.find(q => q.group === matchup[2] && q.position === matchup[3])
    
    return {
      id: `knockout-R16-${idx}`,
      round: 'R16',
      home: home?.team ?? 'TBD',
      away: away?.team ?? 'TBD',
      status: 'pending',
      score: null,
    }
  })
  
  return fixtures
}

const advanceKnockoutRound = (state) => {
  const roundOrder = ['R16', 'QF', 'SF', 'F']
  const currentRound = state.knockoutRound
  const prevRoundIdx = roundOrder.indexOf(currentRound) - 1
  
  if (prevRoundIdx < 0) return
  
  const prevRound = roundOrder[prevRoundIdx]
  const prevFixtures = state.knockoutBracket.filter(f => f.round === prevRound && f.status === 'played')
  
  const winners = prevFixtures.map(f => {
    if (!f.score) return null
    return f.score[0] > f.score[1] ? f.home : f.away
  }).filter(Boolean)
  
  for (let i = 0; i < winners.length; i += 2) {
    if (winners[i] && winners[i + 1]) {
      state.knockoutBracket.push({
        id: `knockout-${currentRound}-${i / 2}`,
        round: currentRound,
        home: winners[i],
        away: winners[i + 1],
        status: 'pending',
        score: null,
      })
    }
  }
}