import { useState } from 'react'
import TeamSelect from './components/TeamSelect.jsx'
import LockerRoom from './components/LockerRoom.jsx'
import MatchFeed from './components/MatchFeed.jsx'

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

function App() {
  const [screen, setScreen] = useState('select') // 'select', 'locker', 'match'
  const [myTeam, setMyTeam] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [matchEvents, setMatchEvents] = useState([])

  const handleTeamSelect = (team) => {
    setMyTeam(team)
    // Pick random opponent
    const others = TEAMS.filter(t => t.name !== team.name)
    const opp = others[Math.floor(Math.random() * others.length)]
    setOpponent(opp)
    setScreen('locker')
  }

  const handleKickOff = (events) => {
    setMatchEvents(events)
    setScreen('match')
  }

  const handleRestart = () => {
    setMyTeam(null)
    setOpponent(null)
    setMatchEvents([])
    setScreen('select')
  }

  return (
    <div className="app">
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
        />
      )}
    </div>
  )
}

export default App
