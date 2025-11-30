import { useState } from 'react'
import { 
  getNextUserFixture, 
  getGroupStandings, 
  getAllGroupStandings
} from '../career/state.js'
import { FORMATIONS, FORMATION_LABELS } from '../data/formations.js'
import './WorldCupHub.css'

const BracketMatch = ({ fixture, userTeam, isFinal }) => (
  <div className={`worldcup-hub__bracket-match ${fixture.home === userTeam || fixture.away === userTeam ? 'has-user' : ''} ${isFinal ? 'final-match' : ''}`}>
    <span className={fixture.home === userTeam ? 'is-user' : ''}>{fixture.home}</span>
    <span className="worldcup-hub__bracket-score">{fixture.status === 'played' ? `${fixture.score[0]} - ${fixture.score[1]}` : 'vs'}</span>
    <span className={fixture.away === userTeam ? 'is-user' : ''}>{fixture.away}</span>
  </div>
)

const WorldCupHub = ({ state, onPlayFixture, onAdvance, onSave, onLoad, onUpdateState }) => {
  const [view, setView] = useState('dashboard')
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  if (!state) return null
  
  const nextFixture = getNextUserFixture(state)
  const allStandings = getAllGroupStandings(state)
  const userGroupStandings = state.userGroup ? getGroupStandings(state, state.userGroup) : []
  
  // Helper to get current lineup (first 11) and bench
  const getLineup = () => state.userSquad ? state.userSquad.slice(0, 11) : []
  const getBench = () => state.userSquad ? state.userSquad.slice(11) : []

  const handlePlayerClick = (player, index, isBench) => {
    if (!selectedPlayer) {
      setSelectedPlayer({ player, index, isBench })
    } else {
      // Swap logic
      const newSquad = [...state.userSquad]
      const sourceIndex = selectedPlayer.isBench ? 11 + selectedPlayer.index : selectedPlayer.index
      const targetIndex = isBench ? 11 + index : index
      
      const temp = newSquad[sourceIndex]
      newSquad[sourceIndex] = newSquad[targetIndex]
      newSquad[targetIndex] = temp
      
      // Update state including teamsLookup to ensure match engine sees the changes
      const updatedUserTeam = { ...state.userTeam, roster: newSquad }
      const updatedTeamsLookup = { ...state.teamsLookup, [state.userTeam.name]: updatedUserTeam }
      
      onUpdateState({ 
        ...state, 
        userSquad: newSquad,
        userTeam: updatedUserTeam,
        teamsLookup: updatedTeamsLookup
      })
      setSelectedPlayer(null)
    }
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
  
  const getRoundName = () => {
    if (state.phase === 'group') return `Group Stage - Matchday ${state.matchday}`
    const roundNames = { R16: 'Round of 16', QF: 'Quarter-Finals', SF: 'Semi-Finals', F: 'Final' }
    return roundNames[state.knockoutRound] || state.knockoutRound
  }

  // Tournament complete states
  if (state.tournamentComplete) {
    if (state.userEliminated) {
      return (
        <div className="worldcup-hub-layout">
          <div className="worldcup-hub__eliminated">
            <h1>ELIMINATED</h1>
            <p>{state.userTeam?.name} has been knocked out of the World Cup.</p>
            <button className="worldcup-hub__btn" onClick={onSave}>Save Progress</button>
          </div>
        </div>
      )
    }
    
    const finalFixture = state.knockoutBracket?.find(f => f.round === 'F' && f.status === 'played')
    if (finalFixture) {
      const userWon = (finalFixture.home === state.userTeam?.name && finalFixture.score[0] > finalFixture.score[1]) ||
                      (finalFixture.away === state.userTeam?.name && finalFixture.score[1] > finalFixture.score[0])
      if (userWon) {
        return (
          <div className="worldcup-hub-layout">
            <div className="worldcup-hub__champion">
              <h1>🏆 WORLD CHAMPIONS! 🏆</h1>
              <p>{state.userTeam?.name} has won the Cyber Football World Cup!</p>
              <button className="worldcup-hub__btn" onClick={onSave}>Save Victory</button>
            </div>
          </div>
        )
      }
    }
  }

  // Show results screen after playing a match
  if (state.pendingResults && state.pendingResults.length > 0) {
    return (
      <div className="worldcup-hub-layout">
        <main className="worldcup-hub-content">
          <header className="worldcup-hub__header">
            <h1>{getRoundName()} - Results</h1>
          </header>
          
          <section className="worldcup-hub__card worldcup-hub__results-card">
            <h2>Matchday {state.matchday} Results</h2>
            
            {state.history.length > 0 && (
              <div className="worldcup-hub__user-result">
                <h3>Your Match</h3>
                {(() => {
                  const userResult = state.history[state.history.length - 1]
                  const isUserHome = userResult.home === state.userTeam?.name
                  const userWon = (isUserHome && userResult.score[0] > userResult.score[1]) ||
                                 (!isUserHome && userResult.score[1] > userResult.score[0])
                  const isDraw = userResult.score[0] === userResult.score[1]
                  return (
                    <div className={`worldcup-hub__result-row ${userWon ? 'win' : isDraw ? 'draw' : 'loss'}`}>
                      <span className="home">{userResult.home}</span>
                      <span className="score">{userResult.score[0]} - {userResult.score[1]}</span>
                      <span className="away">{userResult.away}</span>
                    </div>
                  )
                })()}
              </div>
            )}
            
            {state.pendingResults.length > 0 && (
              <>
                <h3>Other Matches</h3>
                <div className="worldcup-hub__other-results">
                  {state.pendingResults.map(result => (
                    <div key={result.id} className="worldcup-hub__result-row">
                      <span className="group">Group {result.group}</span>
                      <span className="home">{result.home}</span>
                      <span className="score">{result.score[0]} - {result.score[1]}</span>
                      <span className="away">{result.away}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <button 
              className="worldcup-hub__btn worldcup-hub__btn--primary"
              onClick={onAdvance}
            >
              Continue
            </button>
          </section>
        </main>
      </div>
    )
  }

  const renderSidebar = () => (
    <aside className="hub-sidebar">
      <div className="hub-sidebar__logo">
        <h2>WC 2076</h2>
      </div>
      <nav className="hub-sidebar__nav">
        <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
        <button className={view === 'squad' ? 'active' : ''} onClick={() => setView('squad')}>Squad</button>
        <button className={view === 'tactics' ? 'active' : ''} onClick={() => setView('tactics')}>Tactics</button>
        <button className={view === 'standings' ? 'active' : ''} onClick={() => setView('standings')}>Standings</button>
        <button className={view === 'fixtures' ? 'active' : ''} onClick={() => setView('fixtures')}>Fixtures</button>
      </nav>
      <div className="hub-sidebar__footer">
        <button onClick={onSave}>Save</button>
        <button onClick={onLoad}>Load</button>
      </div>
    </aside>
  )

  const renderDashboard = () => (
    <>
      {state.phase === 'group' && nextFixture && (
        <section className="worldcup-hub__card worldcup-hub__next-match">
          <h2>Your Next Match - Matchday {state.matchday}</h2>
          <div className="worldcup-hub__fixture-card">
            <div className="worldcup-hub__teams">
              <div className={`worldcup-hub__team ${nextFixture.home === state.userTeam?.name ? 'is-user' : ''}`}>
                {nextFixture.home}
              </div>
              <div className="worldcup-hub__vs">VS</div>
              <div className={`worldcup-hub__team ${nextFixture.away === state.userTeam?.name ? 'is-user' : ''}`}>
                {nextFixture.away}
              </div>
            </div>
            <button 
              className="worldcup-hub__btn worldcup-hub__btn--primary worldcup-hub__btn--large"
              onClick={() => onPlayFixture(nextFixture)}
            >
              PLAY MATCH
            </button>
          </div>
        </section>
      )}
      
      {state.phase === 'knockout' && (
        <>
          {nextFixture ? (
            <section className="worldcup-hub__card worldcup-hub__next-match">
              <h2>{getRoundName()}</h2>
              <div className="worldcup-hub__fixture-card">
                <div className="worldcup-hub__teams">
                  <div className={`worldcup-hub__team ${nextFixture.home === state.userTeam?.name ? 'is-user' : ''}`}>
                    {nextFixture.home}
                  </div>
                  <div className="worldcup-hub__vs">VS</div>
                  <div className={`worldcup-hub__team ${nextFixture.away === state.userTeam?.name ? 'is-user' : ''}`}>
                    {nextFixture.away}
                  </div>
                </div>
                <button 
                  className="worldcup-hub__btn worldcup-hub__btn--primary worldcup-hub__btn--large"
                  onClick={() => onPlayFixture(nextFixture)}
                >
                  PLAY MATCH
                </button>
              </div>
            </section>
          ) : (
            <section className="worldcup-hub__card">
              <h2>{getRoundName()}</h2>
              <p style={{textAlign: 'center', padding: '1rem'}}>Waiting for next opponent...</p>
            </section>
          )}

          <section className="worldcup-hub__card">
            <h2>Knockout Bracket</h2>
             <div className="worldcup-hub__bracket tree-view">
               {/* Left Side */}
               <div className="bracket-side left">
                 {/* R16 Left */}
                 <div className="bracket-col r16">
                   <h3>R16</h3>
                   {state.knockoutBracket.filter(f => f.round === 'R16').slice(0, 4).map(f => (
                     <BracketMatch key={f.id} fixture={f} userTeam={state.userTeam?.name} />
                   ))}
                 </div>
                 {/* QF Left */}
                 {state.knockoutBracket.some(f => f.round === 'QF') && (
                   <div className="bracket-col qf">
                     <h3>QF</h3>
                     {state.knockoutBracket.filter(f => f.round === 'QF').slice(0, 2).map(f => (
                       <BracketMatch key={f.id} fixture={f} userTeam={state.userTeam?.name} />
                     ))}
                   </div>
                 )}
                 {/* SF Left */}
                 {state.knockoutBracket.some(f => f.round === 'SF') && (
                   <div className="bracket-col sf">
                     <h3>SF</h3>
                     {state.knockoutBracket.filter(f => f.round === 'SF').slice(0, 1).map(f => (
                       <BracketMatch key={f.id} fixture={f} userTeam={state.userTeam?.name} />
                     ))}
                   </div>
                 )}
               </div>

               {/* Final (Center) */}
               <div className="bracket-center">
                 {state.knockoutBracket.some(f => f.round === 'F') ? (
                   <div className="bracket-col final">
                     <h3>FINAL</h3>
                     {state.knockoutBracket.filter(f => f.round === 'F').map(f => (
                       <BracketMatch key={f.id} fixture={f} userTeam={state.userTeam?.name} isFinal />
                     ))}
                   </div>
                 ) : (
                   <div className="bracket-col final-placeholder">
                     <h3>FINAL</h3>
                     <div className="trophy-icon">🏆</div>
                   </div>
                 )}
               </div>

               {/* Right Side */}
               <div className="bracket-side right">
                 {/* SF Right */}
                 {state.knockoutBracket.some(f => f.round === 'SF') && (
                   <div className="bracket-col sf">
                     <h3>SF</h3>
                     {state.knockoutBracket.filter(f => f.round === 'SF').slice(1, 2).map(f => (
                       <BracketMatch key={f.id} fixture={f} userTeam={state.userTeam?.name} />
                     ))}
                   </div>
                 )}
                 {/* QF Right */}
                 {state.knockoutBracket.some(f => f.round === 'QF') && (
                   <div className="bracket-col qf">
                     <h3>QF</h3>
                     {state.knockoutBracket.filter(f => f.round === 'QF').slice(2, 4).map(f => (
                       <BracketMatch key={f.id} fixture={f} userTeam={state.userTeam?.name} />
                     ))}
                   </div>
                 )}
                 {/* R16 Right */}
                 <div className="bracket-col r16">
                   <h3>R16</h3>
                   {state.knockoutBracket.filter(f => f.round === 'R16').slice(4, 8).map(f => (
                     <BracketMatch key={f.id} fixture={f} userTeam={state.userTeam?.name} />
                   ))}
                 </div>
               </div>
            </div>
          </section>
        </>
      )}

      {state.phase === 'group' && userGroupStandings.length > 0 && (
        <section className="worldcup-hub__card">
          <h2>Group {state.userGroup}</h2>
          <table className="worldcup-hub__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>P</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {userGroupStandings.map((row, idx) => (
                <tr 
                  key={row.team} 
                  className={`${row.team === state.userTeam?.name ? 'is-user' : ''} ${idx < 2 ? 'qualifies' : 'eliminated'}`}
                >
                  <td className="position">{idx + 1}</td>
                  <td className="team-name">{row.team}</td>
                  <td>{row.played}</td>
                  <td className="points">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  )

  const renderSquad = () => (
    <section className="worldcup-hub__card">
      <h2>Squad Management</h2>
      <table className="worldcup-hub__table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Name</th>
            <th>Rating</th>
            <th>Condition</th>
            <th>Morale</th>
          </tr>
        </thead>
        <tbody>
          {state.userSquad ? state.userSquad.map(player => (
            <tr key={player.id}>
              <td>{player.position}</td>
              <td>{player.name}</td>
              <td>{player.rating}</td>
              <td>{player.condition}%</td>
              <td>{player.morale}%</td>
            </tr>
          )) : <tr><td colSpan="5">No squad data available. Start a new career to generate squad.</td></tr>}
        </tbody>
      </table>
    </section>
  )

  const renderTactics = () => (
    <section className="worldcup-hub__tactics-section">
      <div className="tactics-header">
        <h2>Tactical Setup</h2>
        <div className="formation-select">
          <label>Formation</label>
          <select 
            value={state.tactics?.formation || '4-3-3'}
            onChange={(e) => {
              const newFormation = e.target.value
              const updatedUserTeam = { ...state.userTeam, formation: newFormation }
              const updatedTeamsLookup = { ...state.teamsLookup, [state.userTeam.name]: updatedUserTeam }
              onUpdateState({
                ...state,
                tactics: { ...state.tactics, formation: newFormation },
                userTeam: updatedUserTeam,
                teamsLookup: updatedTeamsLookup
              })
            }}
          >
            {Object.keys(FORMATIONS).map(key => (
              <option key={key} value={key}>{FORMATION_LABELS[key] || key}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="tactics-layout">
        <div className="squad-list">
          <h3>Bench & Reserves</h3>
          {getBench().map((player, idx) => (
            <div 
              key={player.id} 
              className={`squad-item ${selectedPlayer?.player.id === player.id ? 'selected' : ''}`}
              onClick={() => handlePlayerClick(player, idx, true)}
            >
              <span className="squad-item-pos">{player.position}</span>
              <span className="squad-item-name">{player.name}</span>
              <span className="squad-item-rating">{player.rating}</span>
            </div>
          ))}
        </div>

        <div className="pitch-container">
          {getLineup().map((player, idx) => {
            const coords = getFormationCoords(state.tactics?.formation || '4-3-3', idx)
            return (
              <div 
                key={player.id}
                className={`pitch-player ${selectedPlayer?.player.id === player.id ? 'selected' : ''}`}
                style={coords}
                onClick={() => handlePlayerClick(player, idx, false)}
              >
                <div className="player-dot">
                  {player.rating}
                </div>
                <div className="player-name">
                  {player.name} <span style={{color: '#38ffb5'}}>({player.position})</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )

  const renderStandings = () => (
    <>
    {state.phase === 'group' && (
        <section className="worldcup-hub__card">
          <h2>All Groups</h2>
          <div className="worldcup-hub__all-groups">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(groupName => {
              const standings = allStandings[groupName] || []
              if (standings.length === 0) return null
              
              return (
                <div 
                  key={groupName} 
                  className={`worldcup-hub__mini-group ${groupName === state.userGroup ? 'is-user-group' : ''}`}
                >
                  <h3>Group {groupName}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Team</th>
                        <th>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row, idx) => (
                        <tr 
                          key={row.team} 
                          className={`${row.team === state.userTeam?.name ? 'is-user' : ''} ${idx < 2 ? 'qualifies' : ''}`}
                        >
                          <td className="mini-pos">{idx + 1}</td>
                          <td className="mini-team">{row.team}</td>
                          <td className="mini-pts">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </section>
      )}
      {state.phase === 'knockout' && state.knockoutBracket && (
        <section className="worldcup-hub__card">
          <h2>Knockout Bracket</h2>
           <div className="worldcup-hub__bracket">
            {['R16', 'QF', 'SF', 'F'].map(round => {
              const roundFixtures = state.knockoutBracket.filter(f => f.round === round)
              if (roundFixtures.length === 0) return null
              const roundNames = { R16: 'Round of 16', QF: 'Quarter-Finals', SF: 'Semi-Finals', F: 'Final' }
              return (
                <div key={round} className="worldcup-hub__bracket-round">
                  <h3>{roundNames[round]}</h3>
                  {roundFixtures.map(f => (
                    <div key={f.id} className={`worldcup-hub__bracket-match ${f.home === state.userTeam?.name || f.away === state.userTeam?.name ? 'has-user' : ''}`}>
                      <span className={f.home === state.userTeam?.name ? 'is-user' : ''}>{f.home}</span>
                      <span className="worldcup-hub__bracket-score">{f.status === 'played' ? `${f.score[0]} - ${f.score[1]}` : 'vs'}</span>
                      <span className={f.away === state.userTeam?.name ? 'is-user' : ''}>{f.away}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </>
  )

  const renderFixtures = () => (
    <section className="worldcup-hub__card">
      <h2>Fixtures</h2>
      {state.phase === 'group' && state.groupFixtures && (
          <div className="worldcup-hub__fixtures-list">
            {[1, 2, 3].map(md => {
              const mdFixtures = state.groupFixtures.filter(
                f => f.group === state.userGroup && f.matchday === md
              )
              return (
                <div key={md} className="worldcup-hub__matchday-block">
                  <h4>Matchday {md} {md === state.matchday ? '(Current)' : md < state.matchday ? '(Played)' : ''}</h4>
                  {mdFixtures.map(f => (
                    <div 
                      key={f.id} 
                      className={`worldcup-hub__fixture-row ${f.status === 'played' ? 'played' : ''} ${f.home === state.userTeam?.name || f.away === state.userTeam?.name ? 'has-user' : ''}`}
                    >
                      <span className={f.home === state.userTeam?.name ? 'is-user' : ''}>{f.home}</span>
                      <span className="fixture-score">
                        {f.status === 'played' ? `${f.score[0]} - ${f.score[1]}` : 'vs'}
                      </span>
                      <span className={f.away === state.userTeam?.name ? 'is-user' : ''}>{f.away}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
      )}
    </section>
  )

  return (
    <div className="worldcup-hub-layout">
      {renderSidebar()}
      <main className="worldcup-hub-content">
        <header className="worldcup-hub__header">
          <div>
            <h1>🏆 World Cup 2076</h1>
            <p>{getRoundName()} • {state.userTeam?.name} • Group {state.userGroup}</p>
          </div>
        </header>
        {view === 'dashboard' && renderDashboard()}
        {view === 'squad' && renderSquad()}
        {view === 'tactics' && renderTactics()}
        {view === 'standings' && renderStandings()}
        {view === 'fixtures' && renderFixtures()}
      </main>
    </div>
  )
}

export default WorldCupHub
