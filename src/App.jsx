import { useState } from 'react'
import TeamSelect from './components/TeamSelect.jsx'
import LockerRoom from './components/LockerRoom.jsx'
import MatchFeed from './components/MatchFeed.jsx'
import MainMenu from './components/MainMenu.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import TopBar from './components/TopBar.jsx'
import WorldCupHub from './components/WorldCupHub.jsx'
import { bootCareerState, advanceToNextMatchday, ingestPlayedMatch, getNextUserFixture } from './career/state.js'

const TEAMS = [
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

function App() {
  const [screen, setScreen] = useState('menu')
  const [selectContext, setSelectContext] = useState('quick')
  const [myTeam, setMyTeam] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [matchEvents, setMatchEvents] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [liveScore, setLiveScore] = useState([0, 0])
  const [worldcup, setWorldcup] = useState(null)

  const handlePlayNow = () => {
    setSelectContext('quick')
    setScreen('select')
  }

  const handleTeamSelect = (team) => {
    if (selectContext === 'worldcup') {
      const nextWorldcup = bootCareerState(TEAMS, team)
      setWorldcup(nextWorldcup)
      setMyTeam(team)
      setOpponent(null)
      setScreen('worldcup')
      setSelectContext('quick')
      return
    }
    setMyTeam(team)
    // Pick random opponent
    const others = TEAMS.filter(t => t.name !== team.name)
    const opp = others[Math.floor(Math.random() * others.length)]
    setOpponent(opp)
    setLiveScore([0, 0])
    setScreen('locker')
  }

  const handleKickOff = (events) => {
    setMatchEvents(events)
    setLiveScore([0, 0])
    setScreen('match')
  }

  const handleRestart = () => {
    // Don't reset worldcup state if we're in a worldcup match
    if (worldcup && worldcup.activeFixtureId) {
      // This shouldn't happen, but guard against it
      return
    }
    setMyTeam(null)
    setOpponent(null)
    setMatchEvents([])
    setLiveScore([0, 0])
    setScreen('menu')
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleStartWorldCup = () => {
    setSelectContext('worldcup')
    setScreen('select')
  }

  const handleWorldCupAdvance = () => {
    if (!worldcup) return
    setWorldcup(advanceToNextMatchday(worldcup))
  }

  const handleWorldCupPlayFixture = (fixtureOverride) => {
    if (!worldcup) return
    const targetFixture = fixtureOverride ?? getNextUserFixture(worldcup)
    if (!targetFixture) return
    const isHome = targetFixture.home === worldcup.userTeam.name
    const mySide = isHome ? targetFixture.home : targetFixture.away
    const oppSide = isHome ? targetFixture.away : targetFixture.home
    const myTeamData = TEAMS.find(t => t.name === mySide)
    const oppTeamData = TEAMS.find(t => t.name === oppSide)
    if (!myTeamData || !oppTeamData) return
    setMyTeam(myTeamData)
    setOpponent(oppTeamData)
    setMatchEvents([])
    setLiveScore([0, 0])
    setWorldcup(prev => prev ? { ...prev, activeFixtureId: targetFixture.id } : prev)
    setScreen('locker')
  }

  const handleWorldCupMatchComplete = (result) => {
    const finalScore = result?.score ?? liveScore
    
    setWorldcup(prev => {
      if (!prev || !prev.activeFixtureId) return prev
      return ingestPlayedMatch(prev, { 
        score: finalScore, 
        fixtureId: prev.activeFixtureId 
      })
    })
    
    // Clear match state
    setMyTeam(null)
    setOpponent(null)
    setMatchEvents([])
    setLiveScore([0, 0])
    
    // Return to World Cup hub
    setScreen('worldcup')
  }

  const handleMatchRestart = () => {
    // If in World Cup, go back to hub instead of main menu
    if (worldcup && worldcup.activeFixtureId) {
      // Cancel the match and return to hub
      setWorldcup(prev => prev ? { ...prev, activeFixtureId: null } : prev)
      setMyTeam(null)
      setOpponent(null)
      setMatchEvents([])
      setLiveScore([0, 0])
      setScreen('worldcup')
      return
    }
    
    // Normal quick match restart
    handleRestart()
  }

  return (
    <div className={`app palette-${settings.palette}`} style={{ fontSize: `calc(16px * ${settings.fontScale})` }}>
      <TopBar
        screen={screen}
        myTeam={myTeam}
        opponent={opponent}
        score={liveScore}
        onMenu={handleMatchRestart}
        onSettings={() => setSettingsOpen(true)}
      />
      {screen === 'menu' && (
        <MainMenu
          onPlayNow={handlePlayNow}
          onStartWorldCup={handleStartWorldCup}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}
      {screen === 'select' && (
        <TeamSelect teams={TEAMS} onSelect={handleTeamSelect} />
      )}
      {screen === 'locker' && (
        <LockerRoom 
          myTeam={myTeam} 
          opponent={opponent} 
          onKickOff={handleKickOff} 
        />
      )}
      {screen === 'match' && (
        <MatchFeed 
          events={matchEvents} 
          myTeam={myTeam}
          opponent={opponent}
          onRestart={handleMatchRestart}
          onScoreUpdate={setLiveScore}
          onMatchEnd={worldcup && worldcup.activeFixtureId ? handleWorldCupMatchComplete : handleMatchRestart}
        />
      )}
      {screen === 'worldcup' && worldcup && (
        <WorldCupHub
          state={worldcup}
          onAdvance={handleWorldCupAdvance}
          onPlayFixture={handleWorldCupPlayFixture}
          onSave={() => localStorage.setItem('worldcup-save', JSON.stringify(worldcup))}
          onLoad={() => {
            const saved = localStorage.getItem('worldcup-save')
            if (saved) setWorldcup(JSON.parse(saved))
          }}
        />
      )}
      {settingsOpen && (
        <SettingsModal 
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onChange={handleSettingChange}
        />
      )}
    </div>
  )
}

export default App
