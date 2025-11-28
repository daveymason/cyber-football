function TopBar({ screen, myTeam, opponent, score, onMenu, onSettings }) {
  const showScore = screen === 'match' && myTeam && opponent

  return (
    <header className="top-bar">
      <div className="brand-cluster">
        <div>
          <p className="eyebrow">Cyber Ops Suite</p>
          <span className="brand-title">Cyber Football Manager</span>
        </div>
        <span className="build-pill">2075 Exhibition</span>
      </div>

      {showScore && (
        <div className="live-scoreboard">
          <span className="club" style={{ color: myTeam.color }}>{myTeam.name}</span>
          <span className="score-chip">{score[0]} - {score[1]}</span>
          <span className="club" style={{ color: opponent.color }}>{opponent.name}</span>
        </div>
      )}

      <div className="top-bar-actions">
        <button className="icon-pill" aria-label="Open settings" onClick={onSettings}>
          ☰
        </button>
        <button className="text-pill" onClick={onMenu}>Main Menu</button>
      </div>
    </header>
  )
}

export default TopBar
