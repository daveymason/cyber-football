import { useState, useEffect } from 'react'

function MatchFeed({ events, myTeam, opponent, matchContext, isHome: isHomeProp, onRestart, onScoreUpdate, onMatchEnd }) {
  const [displayedEvents, setDisplayedEvents] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState([0, 0])

  // Use explicit home/away teams based on the played match flag
  // This ensures the display matches the backend simulation orientation
  const homeTeam = matchContext?.homeTeam || (isHomeProp ? myTeam : opponent)
  const awayTeam = matchContext?.awayTeam || (isHomeProp ? opponent : myTeam)

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

  const handleMatchFinish = () => {
    if (onMatchEnd) {
      onMatchEnd({ score: finalScore })
    } else {
      onRestart()
    }
  }

  return (
    <div className="screen match-feed">
      <div className="scoreboard">
        <div className="score-labels">
          <span style={{ color: homeTeam.color, textAlign: 'right', minWidth: '150px' }}>{homeTeam.name}</span>
          <span className="score" style={{ margin: '0 1rem' }}>{finalScore[0]} - {finalScore[1]}</span>
          <span style={{ color: awayTeam.color, textAlign: 'left', minWidth: '150px' }}>{awayTeam.name}</span>
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
          <button onClick={handleMatchFinish}>
            {onMatchEnd ? 'Continue' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  )
}

export default MatchFeed
