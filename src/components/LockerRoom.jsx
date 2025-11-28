import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

const FORMATIONS = {
  '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'ST', 'RW'],
  '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'ST', 'RW'],
  '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'CAM', 'LW', 'ST', 'RW']
}

const getArchetype = (pos) => {
  if (pos === 'GK') return 'Reflex Stopper'
  if (pos.includes('B') && !pos.includes('C')) return 'Wing Back'
  if (pos === 'CB') return 'Stopper'
  if (pos === 'CDM') return 'Anchor'
  if (pos === 'CM') return 'Playmaker'
  if (pos === 'CAM') return 'Shadow Striker'
  if (pos.includes('W')) return 'Winger'
  if (pos === 'ST') return 'Finisher'
  return 'Utility'
}

const buildSquadFromPool = (formation, pool) => {
  const slots = FORMATIONS[formation] || FORMATIONS['4-3-3']
  const roster = [...pool]
  const starters = roster.slice(0, slots.length)
  const lineup = slots.map((slot, idx) => ({
    slot,
    player: starters[idx] ?? { name: 'Academy Prospect', position: slot, archetype: 'Awaiting Promotion', rating: 70 }
  }))
  const bench = roster.slice(slots.length)
  return { lineup, bench }
}

const avgRating = (lineup) => {
  if (!lineup || lineup.length === 0) return 0
  const total = lineup.reduce((s, slot) => s + (slot.player?.rating || 0), 0)
  return Math.round(total / lineup.length)
}

function LockerRoom({ myTeam, opponent, matchContext, onKickOff }) {
  const [formation, setFormation] = useState('4-3-3')
  const [activeTab, setActiveTab] = useState('tactics')

  // Explicitly grab Home and Away teams from context if available, or derive them
  const isHome = matchContext?.isHome ?? true
  // We rely on isHome to determine who is who, ensuring display matches simulation logic
  const homeTeam = isHome ? myTeam : opponent
  const awayTeam = isHome ? opponent : myTeam

  // My squad state
  const [myLineup, setMyLineup] = useState([])
  const [myBench, setMyBench] = useState([])
  const [selectedBench, setSelectedBench] = useState(null)

  // Opponent preview squad
  const [oppFormation, setOppFormation] = useState(() => {
    // random opponent formation
    const keys = Object.keys(FORMATIONS)
    return keys[Math.floor(Math.random() * keys.length)]
  })
  const [oppLineup, setOppLineup] = useState([])
  const [oppBench, setOppBench] = useState([])

  // Helper: create two distinct squads from the shared pool (shuffled and slightly varied)
  const createSquadFor = (team, formationChoice) => {
    const pool = team.roster || []
    const poolWithArchetypes = pool.map(p => ({
      ...p,
      archetype: p.archetype || getArchetype(p.position)
    }))
    return buildSquadFromPool(formationChoice, poolWithArchetypes)
  }

  // initialize squads when component mounts or when teams change
  useEffect(() => {
    if (!myTeam || !opponent) return

    const my = createSquadFor(myTeam, formation)
    setMyLineup(my.lineup)
    setMyBench(my.bench)

    const opp = createSquadFor(opponent, oppFormation)
    setOppLineup(opp.lineup)
    setOppBench(opp.bench)
    setSelectedBench(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTeam, opponent])

  // rebuild my lineup when formation changes
  const handleFormationChange = (nextFormation) => {
    setFormation(nextFormation)
    // combine current players into a pool and rebuild so swaps are preserved where possible
    const pool = [...myLineup.map(s => s.player), ...myBench]
    const rebuilt = buildSquadFromPool(nextFormation, pool)
    setMyLineup(rebuilt.lineup)
    setMyBench(rebuilt.bench)
    setSelectedBench(null)
  }

  // allow selecting bench and swapping
  const handleBenchSelect = (player) => {
    setSelectedBench(prev => (prev?.name === player.name ? null : player))
  }

  const handleStarterSwap = (index) => {
    if (!selectedBench) return
    setMyLineup(prev => {
      const next = [...prev]
      const outgoing = next[index].player
      next[index] = { ...next[index], player: selectedBench }
      setMyBench(prevBench => prevBench.map(p => (p.name === selectedBench.name ? outgoing : p)))
      setSelectedBench(null)
      return next
    })
  }

  const handleKickOff = async () => {
    if (!myTeam || !opponent) return
    
    const myTeamData = {
      name: myTeam.name,
      color: myTeam.color,
      formation,
      rating: avgRating(myLineup),
      players: myLineup.map(s => ({ name: s.player.name, position: s.player.position, rating: s.player.rating }))
    }
    
    const oppTeamData = {
      name: opponent.name,
      color: opponent.color,
      formation: oppFormation,
      rating: avgRating(oppLineup),
      players: oppLineup.map(s => ({ name: s.player.name, position: s.player.position, rating: s.player.rating }))
    }

    const home = isHome ? myTeamData : oppTeamData
    const away = isHome ? oppTeamData : myTeamData

    try {
      const events = await invoke('simulate_match', { home, away })
      // Pass the isHome flag to ensure MatchFeed knows the correct orientation
      onKickOff(events, isHome)
    } catch (e) {
      console.error(e)
    }
  }

  // small UI helper: show opponent formation dropdown in preview (non-editable for user)
  const handleOppFormationChange = (next) => {
    setOppFormation(next)
    const pool = [...oppLineup.map(s => s.player), ...oppBench]
    const rebuilt = buildSquadFromPool(next, pool)
    setOppLineup(rebuilt.lineup)
    setOppBench(rebuilt.bench)
  }


  const myRating = avgRating(myLineup)
  const oppRating = avgRating(oppLineup)

  const isTournament = matchContext?.type === 'tournament'

  // Determine display order based on isHome
  // We simply display Home on Left, Away on Right.
  const leftTeam = homeTeam
  const rightTeam = awayTeam
  
  const leftRating = isHome ? myRating : oppRating
  const rightRating = isHome ? oppRating : myRating
  
  const leftFormation = isHome ? formation : oppFormation
  const rightFormation = isHome ? oppFormation : formation
  
  const leftLineup = isHome ? myLineup : oppLineup
  const rightLineup = isHome ? oppLineup : myLineup

  return (
    <div className="screen locker-room">
      <h1 className="title">Matchday Control Room</h1>

      <div className="h2h-preview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
        <div className={`team-preview home`} style={{ flex: 1, textAlign: 'left' }}>
          <p className="subhead">Home</p>
          <h2 style={{ color: leftTeam?.color }}>{leftTeam?.name}</h2>
          <p>{leftTeam?.focus}</p>
          <p><strong>Overall:</strong> {leftRating}</p>
          <div className="formation-display" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start', marginTop: '12px' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8ea0c4' }}>Formation</span>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.06)', 
              borderRadius: '10px', 
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              color: '#f2f7ff', 
              padding: '8px 12px',
              fontFamily: 'inherit',
              minWidth: '120px',
              textAlign: 'center'
            }}>
              {leftFormation}
            </div>
          </div>
          <table className="preview-table" style={{ marginTop: '12px' }}>
            <thead><tr><th>Slot</th><th>Player</th><th>R</th></tr></thead>
            <tbody>
              {leftLineup.map(s => (
                <tr key={s.slot + s.player.name}>
                  <td>{s.slot}</td>
                  <td>{s.player.name}</td>
                  <td>{s.player.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="vs" style={{ alignSelf: 'center', fontSize: '3rem', fontWeight: 'bold', color: '#00ffcc' }}>VS</div>

        <div className={`team-preview away`} style={{ flex: 1, textAlign: 'right' }}>
          <p className="subhead">Away</p>
          <h2 style={{ color: rightTeam?.color }}>{rightTeam?.name}</h2>
          <p>{rightTeam?.focus}</p>
          <p><strong>Overall:</strong> {rightRating}</p>
          <div className="formation-display" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8ea0c4' }}>Formation</span>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.06)', 
              borderRadius: '10px', 
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              color: '#f2f7ff', 
              padding: '8px 12px',
              fontFamily: 'inherit',
              minWidth: '120px',
              textAlign: 'center'
            }}>
              {rightFormation}
            </div>
          </div>
          <table className="preview-table" style={{ marginLeft: 'auto', marginTop: '12px' }}>
            <thead><tr><th>Slot</th><th>Player</th><th>R</th></tr></thead>
            <tbody>
              {rightLineup.map(s => (
                <tr key={s.slot + s.player.name}>
                  <td>{s.slot}</td>
                  <td>{s.player.name}</td>
                  <td>{s.player.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="locker-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #333' }}>
        <button 
          onClick={() => setActiveTab('tactics')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'tactics' ? '#00ffcc' : '#888', 
            padding: '1rem', cursor: 'pointer', fontSize: '1.1rem', borderBottom: activeTab === 'tactics' ? '2px solid #00ffcc' : 'none'
          }}
        >
          Tactics
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'info' ? '#00ffcc' : '#888', 
            padding: '1rem', cursor: 'pointer', fontSize: '1.1rem', borderBottom: activeTab === 'info' ? '2px solid #00ffcc' : 'none'
          }}
        >
          Match Info
        </button>
      </div>

      {activeTab === 'tactics' && (
        <section className="tactics-panel">
          <div className="tactics-header">
            <div>
              <p className="eyebrow">Tactics</p>
              <h3>Formation &amp; Lineup ({isHome ? 'Home' : 'Away'})</h3>
            </div>
            <label className="formation-select">
              <span>Formation</span>
              <select value={formation} onChange={(e) => handleFormationChange(e.target.value)}>
                {Object.keys(FORMATIONS).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="lineup-grid">
            <div>
              <div className="lineup-header">
                <p className="subhead">Starting XI</p>
                <small>Select a bench player then tap a starter to swap.</small>
              </div>
              <table className="lineup-table">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Player</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {myLineup.map((slot, idx) => (
                    <tr key={slot.slot + slot.player.name} onClick={() => handleStarterSwap(idx)}>
                      <td>{slot.slot}</td>
                      <td>
                        <div>
                          <strong>{slot.player.name}</strong>
                          <small>{slot.player.archetype}</small>
                        </div>
                      </td>
                      <td>{slot.player.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div className="lineup-header">
                <p className="subhead">Bench &amp; Impact Units</p>
              </div>
              <table className="bench-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {myBench.map(player => (
                    <tr 
                      key={player.name}
                      className={selectedBench?.name === player.name ? 'selected' : ''}
                      onClick={() => handleBenchSelect(player)}
                    >
                      <td>{player.name}</td>
                      <td>{player.archetype}</td>
                      <td>{player.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'info' && (
        <section className="info-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3>Match Details</h3>
              <p><strong>Stadium:</strong> Neo-Tokyo Dome</p>
              <p><strong>Attendance:</strong> 54,200 / 60,000</p>
              <p><strong>Weather:</strong> Acid Rain (Roof Closed)</p>
              <p><strong>Referee:</strong> AI-Ref Unit 734</p>
            </div>
            <div>
              <h3>Competition</h3>
              <p><strong>Tournament:</strong> {matchContext?.label || 'Exhibition Match'}</p>
              <p><strong>Stage:</strong> {matchContext?.stage || 'Friendly'}</p>
              {isTournament && <p><strong>Group:</strong> Group B</p>}
            </div>
          </div>
          
          {isTournament && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Recent Form (Last 3)</h3>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <p><strong>{myTeam?.name}</strong></p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#0f0' }}>W</span>
                    <span style={{ color: '#ff0' }}>D</span>
                    <span style={{ color: '#0f0' }}>W</span>
                  </div>
                </div>
                <div>
                  <p><strong>{opponent?.name}</strong></p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#0f0' }}>W</span>
                    <span style={{ color: '#f00' }}>L</span>
                    <span style={{ color: '#ff0' }}>D</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="tactics-footer">
        <div>
          <p className="subhead">Substitutions</p>
          <p className="lead">
            Bench players load neural routines instantly. Select a bench unit, then tap their target slot to schedule the change.
          </p>
        </div>
        <button className="kick-off-btn" onClick={handleKickOff}>
          Launch Match
        </button>
      </div>
    </div>
  )
}

export default LockerRoom
