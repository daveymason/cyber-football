import { useState, useEffect } from 'react'

function MatchFeed({ events, myTeam, opponent, onRestart, onScoreUpdate }) {
  const [displayedEvents, setDisplayedEvents] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState([0, 0])

  useEffect(() => {
    if (currentIndex < events.length) {
      const timer = setTimeout(() => {
        setDisplayedEvents(prev => [...prev, events[currentIndex]])
        setFinalScore(events[currentIndex].score)
        if (onScoreUpdate) {
          onScoreUpdate(events[currentIndex].score)
        }
        setCurrentIndex(prev => prev + 1)
      }, 333) // ~30 seconds for 90 events
      return () => clearTimeout(timer)
    } else if (events.length > 0) {
      setTimeout(() => setGameOver(true), 1000)
      if (onScoreUpdate) {
        onScoreUpdate(events[events.length - 1].score)
      }
    }
  }, [currentIndex, events, onScoreUpdate])

  return (
    <div className="screen match-feed">
      <div className="scoreboard">
        <div className="score-labels">
          <span style={{ color: myTeam.color }}>{myTeam.name}</span>
          <span className="score">{finalScore[0]} - {finalScore[1]}</span>
          <span style={{ color: opponent.color }}>{opponent.name}</span>
        </div>
        <span className="live-pill">Live Sim</span>
      </div>
      <div className="feed">
        {displayedEvents.map((event, i) => (
          <p key={i} className={event.is_goal ? 'goal' : ''}>
            [{event.minute}'] {event.message}
          </p>
        ))}
      </div>
      {gameOver && (
        <div className="game-over">
          <h1>GAME OVER</h1>
          <p className="final-score">{finalScore[0]} - {finalScore[1]}</p>
          <button onClick={onRestart}>PLAY AGAIN</button>
        </div>
      )}
    </div>
  )
}

export default MatchFeed
