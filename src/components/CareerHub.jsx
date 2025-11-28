import { getNextUserFixture, getStandingsArray } from '../career/state.js'

const CareerHub = ({ state, onNextDay, onPlayFixture, onSave, onLoad }) => {
  const nextFixture = getNextUserFixture(state)
  const standings = getStandingsArray(state)
  const recentResults = [...state.history].slice(-5).reverse()
  const activeInjuries = state.injuries.filter(injury => injury.days > 0)

  return (
    <div className="career-hub">
      <header className="career-hub__header">
        <div>
          <h1>World Cup Career</h1>
          <p>Day {state.calendarDay} • {state.userTeam.name}</p>
        </div>
        <div className="career-hub__header-actions">
          <button onClick={onSave}>Save</button>
          <button onClick={onLoad}>Load</button>
        </div>
      </header>

      <section className="career-hub__card">
        <h2>Next Fixture</h2>
        {nextFixture ? (
          <>
            <p>Day {nextFixture.day}: {nextFixture.home} vs {nextFixture.away}</p>
            <div className="career-hub__cta">
              <button
                onClick={() => onPlayFixture(nextFixture)}
                disabled={Boolean(state.activeFixtureId)}
              >
                Play Match
              </button>
              <button
                onClick={onNextDay}
                disabled={Boolean(state.activeFixtureId)}
              >
                Sim Next Day
              </button>
            </div>
          </>
        ) : (
          <p>All fixtures complete. Claim the trophy!</p>
        )}
      </section>

      <section className="career-hub__card">
        <h2>Standings</h2>
        <table className="career-hub__table">
          <thead>
            <tr>
              <th>#</th><th>Team</th><th>Pts</th><th>P</th><th>GF</th><th>GA</th><th>GD</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => (
              <tr key={row.team} className={row.team === state.userTeam.name ? 'is-user' : ''}>
                <td>{idx + 1}</td>
                <td>{row.team}</td>
                <td>{row.points}</td>
                <td>{row.played}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td>{row.goalDiff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="career-hub__grid">
        <div className="career-hub__card">
          <h2>Fatigue</h2>
          <ul>
            {Object.entries(state.fatigue).map(([team, value]) => (
              <li key={team}>
                <strong>{team}</strong>
                <span>{Math.round(value)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="career-hub__card">
          <h2>Injuries</h2>
          {activeInjuries.length === 0 ? (
            <p>No active injuries.</p>
          ) : (
            <ul>
              {activeInjuries.map(injury => (
                <li key={injury.id}>
                  <strong>{injury.team}</strong> • {injury.player} ({injury.days} days)
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="career-hub__card">
        <h2>Recent Results</h2>
        {recentResults.length === 0 ? (
          <p>Nothing recorded yet.</p>
        ) : (
          <ul>
            {recentResults.map(result => (
              <li key={result.id}>
                Day {result.day}: {result.home} {result.score[0]} - {result.score[1]} {result.away}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default CareerHub
