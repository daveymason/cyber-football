import { invoke } from '@tauri-apps/api/core'

const PLAYERS = [
  "Cyber-Striker 01", "Neural-Forward 02", "Synth-Winger 03",
  "Mech-Midfielder 04", "Data-Playmaker 05", "Bio-Engine 06",
  "Chrome-Defender 07", "Steel-Guard 08", "Titan-Stopper 09",
  "Nano-Keeper 10", "Ghost-Sweeper 11"
]

function LockerRoom({ myTeam, opponent, onKickOff }) {
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

  return (
    <div className="screen locker-room">
      <h1 className="title">LOCKER ROOM</h1>
      <div className="versus">
        <div className="team-roster">
          <h2 style={{ color: myTeam.color }}>{myTeam.name}</h2>
          <ul>
            {PLAYERS.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <div className="vs">VS</div>
        <div className="team-roster">
          <h2 style={{ color: opponent.color }}>{opponent.name}</h2>
          <ul>
            {PLAYERS.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </div>
      <button className="kick-off-btn" onClick={handleKickOff}>
        KICK OFF
      </button>
    </div>
  )
}

export default LockerRoom
