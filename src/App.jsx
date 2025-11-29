import { useState } from 'react'
import MusicPlayer from './components/MusicPlayer.jsx'
import { invoke } from '@tauri-apps/api/core'
import TeamSelect from './components/TeamSelect.jsx'
import LockerRoom from './components/LockerRoom.jsx'
import MatchFeed from './components/MatchFeed.jsx'
import MainMenu from './components/MainMenu.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import TopBar from './components/TopBar.jsx'
import WorldCupHub from './components/WorldCupHub.jsx'
import { bootCareerState, advanceToNextMatchday, ingestPlayedMatch, getNextUserFixture } from './career/state.js'
import { TEAMS_DB as TEAMS } from './data/db.js'

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
  const [matchContext, setMatchContext] = useState(null) // { type: 'exhibition' | 'tournament', label: string, stage?: string }
  const [playedMatchIsHome, setPlayedMatchIsHome] = useState(true)

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
    
    // For Quick Match, User is always Home for simplicity unless we want to randomize
    const isHome = true
    setMatchContext({ 
      type: 'exhibition', 
      label: 'Exhibition Match', 
      stage: 'Friendly', 
      isHome,
      homeTeam: team,
      awayTeam: opp
    })
    setScreen('locker')
  }

  const handleKickOff = (events, isHome) => {
    setMatchEvents(events)
    setLiveScore([0, 0])
    // Ensure we capture the boolean value, defaulting to true only if undefined
    setPlayedMatchIsHome(typeof isHome === 'boolean' ? isHome : true)
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
    
    // Determine Home/Away based on fixture
    const isHome = targetFixture.home === worldcup.userTeam.name
    const homeName = targetFixture.home
    const awayName = targetFixture.away
    
    // Retrieve team data from the worldcup state lookup to ensure consistency
    const homeTeamData = worldcup.teamsLookup[homeName] || TEAMS.find(t => t.name === homeName)
    const awayTeamData = worldcup.teamsLookup[awayName] || TEAMS.find(t => t.name === awayName)
    
    if (!homeTeamData || !awayTeamData) return

    // Set the teams for the match context
    // Note: We are NOT setting myTeam/opponent here in the traditional sense of "Left/Right"
    // We are setting them based on who is Home and Away for the match engine
    setMyTeam(isHome ? homeTeamData : awayTeamData) // "My Team" is the user's team
    setOpponent(isHome ? awayTeamData : homeTeamData) // "Opponent" is the other team
    
    setMatchEvents([])
    setLiveScore([0, 0])
    setWorldcup(prev => prev ? { ...prev, activeFixtureId: targetFixture.id } : prev)
    setMatchContext({ 
      type: 'tournament', 
      label: 'Cyber World Cup', 
      stage: 'Group Stage', 
      isHome,
      homeTeam: homeTeamData,
      awayTeam: awayTeamData
    })
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

  const handleSaveGame = async () => {
    if (!worldcup) return
    try {
      await invoke('save_game', { data: JSON.stringify(worldcup) })
      alert('Game Saved!')
    } catch (e) {
      console.error('Failed to save game:', e)
      alert('Failed to save game: ' + e)
    }
  }

  const handleLoadGame = async () => {
    try {
      const saved = await invoke('load_game')
      if (saved) {
        const loadedState = JSON.parse(saved)
        setWorldcup(loadedState)
        setScreen('worldcup')
        alert('Game Loaded!')
      } else {
        alert('No saved game found.')
      }
    } catch (e) {
      console.error('Failed to load game:', e)
      alert('Failed to load game: ' + e)
    }
  }

  return (
    <div className={`app palette-${settings.palette}`} style={{ fontSize: `calc(16px * ${settings.fontScale})` }}>
      <MusicPlayer volume={settings.masterVolume} />
      {screen !== 'menu' && (
        <TopBar
          screen={screen}
          myTeam={myTeam}
          opponent={opponent}
          score={liveScore}
          isHome={playedMatchIsHome}
          onMenu={handleMatchRestart}
          onSettings={() => setSettingsOpen(true)}
        />
      )}
      {screen === 'menu' && (
        <MainMenu
          onPlayNow={handlePlayNow}
          onStartWorldCup={handleStartWorldCup}
          onLoadGame={handleLoadGame}
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
          matchContext={matchContext}
          onKickOff={handleKickOff} 
        />
      )}
      {screen === 'match' && (
        <MatchFeed 
          events={matchEvents} 
          myTeam={myTeam}
          opponent={opponent}
          matchContext={matchContext}
          isHome={playedMatchIsHome}
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
          onSave={handleSaveGame}
          onLoad={handleLoadGame}
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
