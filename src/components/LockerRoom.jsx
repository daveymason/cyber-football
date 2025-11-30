import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { FORMATIONS, FORMATION_LABELS } from '../data/formations.js'

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

const getFormationCoords = (formation, index) => {
  // GK is always index 0
  if (index === 0) return { bottom: '2%', left: '50%', transform: 'translateX(-50%)' }

  const formations = {
    '4-3-3': [
      // Defenders (1-4): LB, CB, CB, RB
      { bottom: '18%', left: '15%' }, { bottom: '18%', left: '38%' }, { bottom: '18%', left: '62%' }, { bottom: '18%', left: '85%' },
      // Midfielders (5-7): CM, CDM, CM
      { bottom: '45%', left: '20%' }, { bottom: '35%', left: '50%' }, { bottom: '45%', left: '80%' },
      // Forwards (8-10): LW, ST, RW
      { bottom: '75%', left: '15%' }, { bottom: '82%', left: '50%' }, { bottom: '75%', left: '85%' }
    ],
    '4-4-2': [
      // Defenders
      { bottom: '18%', left: '15%' }, { bottom: '18%', left: '38%' }, { bottom: '18%', left: '62%' }, { bottom: '18%', left: '85%' },
      // Midfielders
      { bottom: '45%', left: '15%' }, { bottom: '45%', left: '38%' }, { bottom: '45%', left: '62%' }, { bottom: '45%', left: '85%' },
      // Forwards
      { bottom: '80%', left: '35%' }, { bottom: '80%', left: '65%' }
    ],
    '3-5-2': [
      // Defenders (3)
      { bottom: '18%', left: '25%' }, { bottom: '18%', left: '50%' }, { bottom: '18%', left: '75%' },
      // Midfielders (5)
      { bottom: '45%', left: '10%' }, { bottom: '45%', left: '30%' }, { bottom: '35%', left: '50%' }, { bottom: '45%', left: '70%' }, { bottom: '45%', left: '90%' },
      // Forwards (2)
      { bottom: '80%', left: '35%' }, { bottom: '80%', left: '65%' }
    ],
    '5-3-2': [
      // Defenders (5)
      { bottom: '20%', left: '10%' }, { bottom: '18%', left: '30%' }, { bottom: '15%', left: '50%' }, { bottom: '18%', left: '70%' }, { bottom: '20%', left: '90%' },
      // Midfielders (3)
      { bottom: '45%', left: '30%' }, { bottom: '45%', left: '50%' }, { bottom: '45%', left: '70%' },
      // Forwards (2)
      { bottom: '75%', left: '35%' }, { bottom: '75%', left: '65%' }
    ],
    '3-4-3': [
      // Defenders (3)
      { bottom: '18%', left: '25%' }, { bottom: '18%', left: '50%' }, { bottom: '18%', left: '75%' },
      // Midfielders (4)
      { bottom: '45%', left: '15%' }, { bottom: '45%', left: '38%' }, { bottom: '45%', left: '62%' }, { bottom: '45%', left: '85%' },
      // Forwards (3)
      { bottom: '75%', left: '15%' }, { bottom: '82%', left: '50%' }, { bottom: '75%', left: '85%' }
    ],
    '4-2-3-1': [
      // Defenders (4)
      { bottom: '18%', left: '15%' }, { bottom: '18%', left: '38%' }, { bottom: '18%', left: '62%' }, { bottom: '18%', left: '85%' },
      // CDMs (2)
      { bottom: '35%', left: '35%' }, { bottom: '35%', left: '65%' },
      // CAMs/Wingers (3)
      { bottom: '60%', left: '20%' }, { bottom: '60%', left: '50%' }, { bottom: '60%', left: '80%' },
      // ST (1)
      { bottom: '82%', left: '50%' }
    ]
  }

  const layout = formations[formation] || formations['4-3-3']
  // Adjust index for non-GK players (index 1 becomes layout[0])
  const pos = layout[index - 1]
  
  if (!pos) return { bottom: '0', left: '0' } // Fallback
  return { ...pos, transform: 'translateX(-50%)' }
}

function LockerRoom({ myTeam, opponent, matchContext, onKickOff }) {
  const [formation, setFormation] = useState('4-3-3')
  const [activeTab, setActiveTab] = useState('squads')

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

    const isKnockout = matchContext?.type === 'tournament' && matchContext?.stage !== 'Group Stage'

    try {
      const events = await invoke('simulate_match', { home, away, isKnockout })
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

      <div className="locker-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #333' }}>
        <button 
          onClick={() => setActiveTab('squads')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'squads' ? '#00ffcc' : '#888', 
            padding: '1rem', cursor: 'pointer', fontSize: '1.1rem', borderBottom: activeTab === 'squads' ? '2px solid #00ffcc' : 'none'
          }}
        >
          Squads
        </button>
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

      {activeTab === 'squads' && (
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
      )}

      {activeTab === 'tactics' && (
        <section className="worldcup-hub__tactics-section">
          <div className="tactics-header">
            <div>
              <p className="eyebrow">Tactics</p>
              <h3>Formation &amp; Lineup ({isHome ? 'Home' : 'Away'})</h3>
            </div>
            <div className="formation-select">
              <label>Formation</label>
              <select value={formation} onChange={(e) => handleFormationChange(e.target.value)}>
                {Object.keys(FORMATIONS).map(key => (
                  <option key={key} value={key}>{FORMATION_LABELS[key] || key}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tactics-layout">
            <div className="squad-list">
              <h3>Bench & Reserves</h3>
              {myBench.map((player) => (
                <div 
                  key={player.name} 
                  className={`squad-item ${selectedBench?.name === player.name ? 'selected' : ''}`}
                  onClick={() => handleBenchSelect(player)}
                >
                  <span className="squad-item-pos">{player.position}</span>
                  <span className="squad-item-name">{player.name}</span>
                  <span className="squad-item-rating">{player.rating}</span>
                </div>
              ))}
            </div>

            <div className="pitch-container">
              {myLineup.map((slot, idx) => {
                const coords = getFormationCoords(formation, idx)
                return (
                  <div 
                    key={slot.slot + slot.player.name}
                    className="pitch-player"
                    style={coords}
                    onClick={() => handleStarterSwap(idx)}
                  >
                    <div className="player-dot">
                      {slot.player.rating}
                    </div>
                    <div className="player-name">
                      {slot.player.name} <span style={{color: '#38ffb5'}}>({slot.slot})</span>
                    </div>
                  </div>
                )
              })}
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
        {activeTab === 'tactics' ? (
          <div>
            <p className="subhead">Substitutions</p>
            <p className="lead">
              Bench players load neural routines instantly. Select a bench unit, then tap their target slot to schedule the change.
            </p>
          </div>
        ) : (
          <div />
        )}
        <button className="kick-off-btn" onClick={handleKickOff}>
          Launch Match
        </button>
      </div>
    </div>
  )
}

export default LockerRoom
