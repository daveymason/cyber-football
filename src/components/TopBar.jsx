function TopBar({ screen, myTeam, opponent, score, isHome, onMenu, onSettings }) {
  const showScore = screen === 'match' && myTeam && opponent

  // Determine display order based on home/away status
  // Score is always [Home, Away]
  // If user is Home: myTeam (Left) vs Opponent (Right)
  // If user is Away: Opponent (Left) vs myTeam (Right)
  const userIsHome = isHome !== false
  const leftTeam = userIsHome ? myTeam : opponent
  const rightTeam = userIsHome ? opponent : myTeam

  return (
    <header className="top-bar">
      <div className="brand-cluster">
        <div>
          <span className="brand-title">Cyber Football Coach</span>
        </div>
      </div>

      {showScore && (
        <div className="live-scoreboard">
          <span className="club" style={{ color: leftTeam.color }}>{leftTeam.name}</span>
          <span className="score-chip">{score[0]} - {score[1]}</span>
          <span className="club" style={{ color: rightTeam.color }}>{rightTeam.name}</span>
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
