import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

const PLAYER_POOL = [
  { name: 'Atlas Keeper', position: 'GK', archetype: 'Reflex Stopper', rating: 92 },
  { name: 'Chrome Sentinel', position: 'CB', archetype: 'Aerial Defender', rating: 89 },
  { name: 'Nano Phalanx', position: 'CB', archetype: 'Predictive Marker', rating: 87 },
  { name: 'Pulse Sprint', position: 'RB', archetype: 'Overlap Runner', rating: 85 },
  { name: 'Ion Anchor', position: 'LB', archetype: 'Ball-Winning Back', rating: 84 },
  { name: 'Circuit Core', position: 'CDM', archetype: 'Shield Drone', rating: 88 },
  { name: 'Neuro Loom', position: 'CM', archetype: 'Tempo Synth', rating: 86 },
  { name: 'Quantum Flair', position: 'CAM', archetype: 'Chance Architect', rating: 90 },
  { name: 'Holo Drift', position: 'RW', archetype: 'Inverted Blade', rating: 87 },
  { name: 'Vector Lance', position: 'ST', archetype: 'Clinical Finisher', rating: 91 },
  { name: 'Plasma Veil', position: 'LW', archetype: 'Drift Maestro', rating: 88 },
  { name: 'Ion Reserve', position: 'CB', archetype: 'Relentless Press', rating: 82 },
  { name: 'Data Surge', position: 'CM', archetype: 'Metronome', rating: 83 },
  { name: 'Echo Phantom', position: 'LW', archetype: 'Shock Impact', rating: 81 },
  { name: 'Grav Pivot', position: 'ST', archetype: 'Hold-up Target', rating: 84 },
  { name: 'Flux Dagger', position: 'RB', archetype: 'Wide Enforcer', rating: 80 }
]

const FORMATIONS = {
  '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'ST', 'RW'],
  '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'ST', 'RW'],
  '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'CAM', 'LW', 'ST', 'RW']
}

const buildSquad = (formation, players) => {
  const slots = FORMATIONS[formation]
  const pool = [...players]
  const starters = pool.slice(0, slots.length)
  const lineup = slots.map((slot, idx) => ({
    slot,
    player: starters[idx] ?? { name: 'Academy Prospect', position: slot, archetype: 'Awaiting Promotion', rating: 70 }
  }))
  const bench = pool.slice(slots.length)
  return { lineup, bench }
}

const INITIAL_SQUAD = buildSquad('4-3-3', PLAYER_POOL)

function LockerRoom({ myTeam, opponent, onKickOff }) {
  const [formation, setFormation] = useState('4-3-3')
  const [lineup, setLineup] = useState(INITIAL_SQUAD.lineup)
  const [bench, setBench] = useState(INITIAL_SQUAD.bench)
  const [selectedBench, setSelectedBench] = useState(null)

  const handleKickOff = async () => {
    try {
      const events = await invoke('simulate_match', {
        homeTeam: myTeam.name,
        awayTeam: opponent.name
      })
      onKickOff(events)
    } catch (e) {
      console.error(e)
    }
  }

  const handleFormationChange = (nextFormation) => {
    const rosterPool = [...lineup.map(slot => slot.player), ...bench]
    const updated = buildSquad(nextFormation, rosterPool)
    setFormation(nextFormation)
    setLineup(updated.lineup)
    setBench(updated.bench)
    setSelectedBench(null)
  }

  const handleBenchSelect = (player) => {
    setSelectedBench(prev => (prev?.name === player.name ? null : player))
  }

  const handleStarterSwap = (index) => {
    if (!selectedBench) return
    setLineup(prev => {
      const next = [...prev]
      const outgoing = next[index].player
      next[index] = { ...next[index], player: selectedBench }
      setBench(prevBench => prevBench.map(p => (p.name === selectedBench.name ? outgoing : p)))
      setSelectedBench(null)
      return next
    })
  }

  return (
    <div className="screen locker-room">
      <h1 className="title">Matchday Control Room</h1>
      <div className="versus">
        <div className="team-roster">
          <p className="subhead">Home</p>
          <h2 style={{ color: myTeam.color }}>{myTeam.name}</h2>
          <p>{myTeam.focus}</p>
        </div>
        <div className="vs">VS</div>
        <div className="team-roster">
          <p className="subhead">Away</p>
          <h2 style={{ color: opponent.color }}>{opponent.name}</h2>
          <p>{opponent.focus}</p>
        </div>
      </div>

      <section className="tactics-panel">
        <div className="tactics-header">
          <div>
            <p className="eyebrow">Tactics</p>
            <h3>Formation &amp; Lineup</h3>
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
                {lineup.map((slot, idx) => (
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
                {bench.map(player => (
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
