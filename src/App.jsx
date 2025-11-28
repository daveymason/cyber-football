import { useState } from 'react'
import TeamSelect from './components/TeamSelect.jsx'
import LockerRoom from './components/LockerRoom.jsx'
import MatchFeed from './components/MatchFeed.jsx'
import MainMenu from './components/MainMenu.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import TopBar from './components/TopBar.jsx'

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

function App() {
  const [screen, setScreen] = useState('menu') // 'menu', 'select', 'locker', 'match'
  const [myTeam, setMyTeam] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [matchEvents, setMatchEvents] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [liveScore, setLiveScore] = useState([0, 0])

  const handlePlayNow = () => {
    setScreen('select')
  }

  const handleTeamSelect = (team) => {
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

  return (
    <div className={`app palette-${settings.palette}`} style={{ fontSize: `calc(16px * ${settings.fontScale})` }}>
      <TopBar
        screen={screen}
        myTeam={myTeam}
        opponent={opponent}
        score={liveScore}
        onMenu={handleRestart}
        onSettings={() => setSettingsOpen(true)}
      />
      {screen === 'menu' && (
        <MainMenu
          onPlayNow={handlePlayNow}
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
          onRestart={handleRestart} 
          onScoreUpdate={setLiveScore}
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
