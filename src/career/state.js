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

const PLAYER_NAMES = {
  'Japan': { first: ['Hiroshi', 'Kenji', 'Taro', 'Yuki', 'Daiki'], last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe'] },
  'Germany': { first: ['Hans', 'Lukas', 'Maximilian', 'Felix', 'Leon'], last: ['Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber'] },
  'Nigeria': { first: ['Chinedu', 'Emeka', 'Tunde', 'Yakubu', 'Victor'], last: ['Okafor', 'Adebayo', 'Okeke', 'Balogun', 'Osimhen'] },
  'Mexico': { first: ['Jose', 'Luis', 'Carlos', 'Miguel', 'Javier'], last: ['Hernandez', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez'] },
  'USA': { first: ['James', 'John', 'Robert', 'Michael', 'William'], last: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown'] },
  'England': { first: ['Harry', 'George', 'Oliver', 'Jack', 'Charlie'], last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Kane'] },
  'Iran': { first: ['Ali', 'Mohammad', 'Reza', 'Hossein', 'Mehdi'], last: ['Hosseini', 'Mohammadi', 'Karimi', 'Rezaei', 'Taremi'] },
  'South Korea': { first: ['Min-jae', 'Heung-min', 'Kang-in', 'Woo-yeong', 'In-beom'], last: ['Kim', 'Lee', 'Park', 'Choi', 'Son'] },
  'Brazil': { first: ['Neymar', 'Vinicius', 'Rodrygo', 'Casemiro', 'Alisson'], last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Junior'] },
  'France': { first: ['Kylian', 'Antoine', 'Olivier', 'Hugo', 'Theo'], last: ['Mbappe', 'Griezmann', 'Giroud', 'Lloris', 'Hernandez'] },
  'Saudi Arabia': { first: ['Salem', 'Salman', 'Yasser', 'Fahad', 'Mohammed'], last: ['Al-Dossari', 'Al-Faraj', 'Al-Shahrani', 'Al-Muwallad', 'Kanno'] },
  'Poland': { first: ['Robert', 'Wojciech', 'Piotr', 'Kamil', 'Jan'], last: ['Lewandowski', 'Szczesny', 'Zielinski', 'Glik', 'Bednarek'] },
  'Argentina': { first: ['Lionel', 'Julian', 'Enzo', 'Alexis', 'Emiliano'], last: ['Messi', 'Alvarez', 'Fernandez', 'Mac Allister', 'Martinez'] },
  'Netherlands': { first: ['Virgil', 'Frenkie', 'Memphis', 'Cody', 'Nathan'], last: ['van Dijk', 'de Jong', 'Depay', 'Gakpo', 'Ake'] },
  'Morocco': { first: ['Achraf', 'Hakim', 'Yassine', 'Sofyan', 'Romain'], last: ['Hakimi', 'Ziyech', 'Bounou', 'Amrabat', 'Saiss'] },
  'Australia': { first: ['Mathew', 'Aaron', 'Harry', 'Jackson', 'Mitchell'], last: ['Ryan', 'Mooy', 'Souttar', 'Irvine', 'Duke'] },
  'Spain': { first: ['Pedri', 'Gavi', 'Rodri', 'Alvaro', 'Unai'], last: ['Gonzalez', 'Paez', 'Hernandez', 'Morata', 'Simon'] },
  'Canada': { first: ['Alphonso', 'Jonathan', 'Stephen', 'Tajon', 'Cyle'], last: ['Davies', 'David', 'Eustaquio', 'Buchanan', 'Larin'] },
  'Senegal': { first: ['Sadio', 'Kalidou', 'Edouard', 'Idrissa', 'Ismaila'], last: ['Mane', 'Koulibaly', 'Mendy', 'Gueye', 'Sarr'] },
  'Serbia': { first: ['Dusan', 'Aleksandar', 'Sergej', 'Filip', 'Nikola'], last: ['Tadic', 'Mitrovic', 'Vlahovic', 'Kostic', 'Milenkovic'] },
  'China': { first: ['Wu', 'Zhang', 'Yan', 'Wei', 'Dai'], last: ['Lei', 'Linpeng', 'Junling', 'Shihao', 'Wai-Tsun'] },
  'Egypt': { first: ['Mohamed', 'Mahmoud', 'Ahmed', 'Tarek', 'Omar'], last: ['Salah', 'Trezeguet', 'Hegazi', 'Hamed', 'Marmoush'] },
  'Portugal': { first: ['Cristiano', 'Bruno', 'Bernardo', 'Ruben', 'Joao'], last: ['Ronaldo', 'Fernandes', 'Silva', 'Dias', 'Felix'] },
  'Ghana': { first: ['Thomas', 'Andre', 'Jordan', 'Mohammed', 'Daniel'], last: ['Partey', 'Ayew', 'Kudus', 'Salisu', 'Amartey'] },
  'Russia': { first: ['Aleksandr', 'Artem', 'Denis', 'Georgi', 'Fedor'], last: ['Golovin', 'Dzyuba', 'Cheryshev', 'Dzhikiya', 'Smolov'] },
  'Switzerland': { first: ['Granit', 'Xherdan', 'Manuel', 'Yann', 'Breel'], last: ['Xhaka', 'Shaqiri', 'Akanji', 'Sommer', 'Embolo'] },
  'Colombia': { first: ['James', 'Radamel', 'Luis', 'Juan', 'Davinson'], last: ['Rodriguez', 'Falcao', 'Diaz', 'Cuadrado', 'Sanchez'] },
  'Tunisia': { first: ['Youssef', 'Wahbi', 'Ellyes', 'Dylan', 'Aissa'], last: ['Msakni', 'Khazri', 'Skhiri', 'Bronn', 'Laidouni'] },
  'India': { first: ['Sunil', 'Gurpreet', 'Sandesh', 'Anirudh', 'Lallianzuala'], last: ['Chhetri', 'Singh', 'Jhingan', 'Thapa', 'Chhangte'] },
  'Sweden': { first: ['Dejan', 'Emil', 'Victor', 'Alexander', 'Robin'], last: ['Kulusevski', 'Forsberg', 'Lindelof', 'Isak', 'Olsen'] },
  'Uruguay': { first: ['Federico', 'Darwin', 'Rodrigo', 'Jose', 'Ronald'], last: ['Valverde', 'Nunez', 'Bentancur', 'Gimenez', 'Araujo'] },
  'Cameroon': { first: ['Vincent', 'Eric', 'Andre-Frank', 'Bryan', 'Karl'], last: ['Aboubakar', 'Choupo-Moting', 'Zambo Anguissa', 'Mbeumo', 'Toko Ekambi'] },
  'Default': { first: ['Cyber', 'Neon', 'Tech', 'Data', 'Net'], last: ['Player', 'Striker', 'Runner', 'Kicker', 'Goalie'] }
}

export const bootCareerState = (teams, selectedTeam) => {
  const groups = assignGroups(teams)
  const userGroup = findUserGroup(groups, selectedTeam.name)
  
  // Use the roster from the selected team object (from db.js) instead of generating a new one
  const userSquad = selectedTeam.roster ? selectedTeam.roster.map(p => ({
    ...p,
    condition: 100,
    morale: 80 + Math.floor(Math.random() * 20)
  })) : generateSquad(selectedTeam.name)

  return {
    phase: 'group',
    matchday: 1,
    userTeam: selectedTeam,
    userSquad,
    tactics: { formation: '4-3-3', style: selectedTeam.focus },
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
      pendingResults.push({ ...fixture, score: result.score })
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
      pendingResults.push({ ...fixture, score: result.score })
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
      return next
    }
    const qualified = determineQualifiedTeams(next)
    if (!qualified.some(q => q.team === next.userTeam.name)) {
      next.userEliminated = true
      next.tournamentComplete = true
      return next
    }
    next.phase = 'knockout'
    next.knockoutRound = 'R16'
    next.knockoutBracket = generateKnockoutBracket(qualified)
    next.matchday += 1
    return next
  }

  if (next.phase === 'knockout') {
    const roundOrder = ['R16', 'QF', 'SF', 'F']
    const userFixture = next.knockoutBracket.find(f =>
      f.round === next.knockoutRound &&
      (f.home === next.userTeam.name || f.away === next.userTeam.name)
    )
    if (userFixture && userFixture.status === 'played') {
      const userIsHome = userFixture.home === next.userTeam.name
      const userGoals = userIsHome ? userFixture.score[0] : userFixture.score[1]
      const oppGoals = userIsHome ? userFixture.score[1] : userFixture.score[0]
      if (userGoals < oppGoals) {
        next.userEliminated = true
        next.tournamentComplete = true
        return next
      }
    }
    const idx = roundOrder.indexOf(next.knockoutRound)
    if (idx === -1) return next
    if (idx === roundOrder.length - 1) {
      next.tournamentComplete = true
      return next
    }
    advanceKnockoutRound(next, roundOrder[idx + 1])
    next.knockoutRound = roundOrder[idx + 1]
    next.matchday += 1
    return next
  }
  return next
}

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
    // Matchday 1
    fixtures.push({ id: `group-${groupName}-md1-1`, group: groupName, matchday: 1, home: teamNames[0], away: teamNames[1], status: 'pending', score: null })
    fixtures.push({ id: `group-${groupName}-md1-2`, group: groupName, matchday: 1, home: teamNames[2], away: teamNames[3], status: 'pending', score: null })
    // Matchday 2
    fixtures.push({ id: `group-${groupName}-md2-1`, group: groupName, matchday: 2, home: teamNames[0], away: teamNames[2], status: 'pending', score: null })
    fixtures.push({ id: `group-${groupName}-md2-2`, group: groupName, matchday: 2, home: teamNames[1], away: teamNames[3], status: 'pending', score: null })
    // Matchday 3
    fixtures.push({ id: `group-${groupName}-md3-1`, group: groupName, matchday: 3, home: teamNames[0], away: teamNames[3], status: 'pending', score: null })
    fixtures.push({ id: `group-${groupName}-md3-2`, group: groupName, matchday: 3, home: teamNames[1], away: teamNames[2], status: 'pending', score: null })
  })
  return fixtures
}

const buildGroupStandings = (groups) => {
  const standings = {}
  Object.entries(groups).forEach(([groupName, teamNames]) => {
    standings[groupName] = teamNames.map(name => ({
      team: name, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0
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
      player: generatePlayerName(injuredTeam),
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
    row.won += 1; row.points += 3
  } else if (goalsFor === goalsAgainst) {
    row.drawn += 1; row.points += 1
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

const generatePlayerName = (teamName) => {
  const names = PLAYER_NAMES[teamName] || PLAYER_NAMES['Default']
  const first = names.first[Math.floor(Math.random() * names.first.length)]
  const last = names.last[Math.floor(Math.random() * names.last.length)]
  return `${first} ${last}`
}

const generateSquad = (teamName) => {
  const positions = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'SUB', 'SUB', 'SUB', 'SUB']
  return positions.map((pos, idx) => ({
    id: `player-${teamName}-${idx}`,
    name: generatePlayerName(teamName),
    position: pos,
    rating: 70 + Math.floor(Math.random() * 20),
    condition: 100,
    morale: 80 + Math.floor(Math.random() * 20)
  }))
}

const determineQualifiedTeams = (state) => {
  return Object.keys(state.groups).flatMap(groupName => {
    const sorted = getGroupStandings(state, groupName)
    return [
      sorted[0] ? { team: sorted[0].team, position: '1st', group: groupName } : null,
      sorted[1] ? { team: sorted[1].team, position: '2nd', group: groupName } : null,
    ].filter(Boolean)
  })
}

const generateKnockoutBracket = (qualified) => {
  const matchups = [
    ['A', '1st', 'B', '2nd'], ['C', '1st', 'D', '2nd'],
    ['E', '1st', 'F', '2nd'], ['G', '1st', 'H', '2nd'],
    ['B', '1st', 'A', '2nd'], ['D', '1st', 'C', '2nd'],
    ['F', '1st', 'E', '2nd'], ['H', '1st', 'G', '2nd'],
  ]
  return matchups.map((m, idx) => ({
    id: `knockout-R16-${idx}`,
    round: 'R16',
    home: qualified.find(q => q.group === m[0] && q.position === m[1])?.team ?? 'TBD',
    away: qualified.find(q => q.group === m[2] && q.position === m[3])?.team ?? 'TBD',
    status: 'pending',
    score: null,
  }))
}

const advanceKnockoutRound = (state, nextRound) => {
  const roundOrder = ['R16', 'QF', 'SF', 'F']
  const prevRoundIdx = roundOrder.indexOf(nextRound) - 1
  if (prevRoundIdx < 0) return
  const prevRound = roundOrder[prevRoundIdx]
  const prevFixtures = state.knockoutBracket.filter(f => f.round === prevRound && f.status === 'played')
  const winners = prevFixtures.map(f => (f.score && f.score[0] > f.score[1] ? f.home : f.away)).filter(Boolean)
  for (let i = 0; i < winners.length; i += 2) {
    if (!winners[i] || !winners[i + 1]) continue
    state.knockoutBracket.push({
      id: `knockout-${nextRound}-${i / 2}`,
      round: nextRound,
      home: winners[i],
      away: winners[i + 1],
      status: 'pending',
      score: null,
    })
  }
}