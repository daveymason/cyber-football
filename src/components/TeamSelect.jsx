import './TeamSelect.css'

const FLAG_EMOJI = {
  Japan: '🇯🇵', Germany: '🇩🇪', Nigeria: '🇳🇬', Mexico: '🇲🇽',
  USA: '🇺🇸', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Iran: '🇮🇷', 'South Korea': '🇰🇷',
  Brazil: '🇧🇷', France: '🇫🇷', 'Saudi Arabia': '🇸🇦', Poland: '🇵🇱',
  Argentina: '🇦🇷', Netherlands: '🇳🇱', Morocco: '🇲🇦', Australia: '🇦🇺',
  Spain: '🇪🇸', Canada: '🇨🇦', Senegal: '🇸🇳', Serbia: '🇷🇸',
  China: '🇨🇳', Egypt: '🇪🇬', Portugal: '🇵🇹', Ghana: '🇬🇭',
  Russia: '🇷🇺', Switzerland: '🇨🇭', Colombia: '🇨🇴', Tunisia: '🇹🇳',
  India: '🇮🇳', Sweden: '🇸🇪', Uruguay: '🇺🇾', Cameroon: '🇨🇲',
}

const getTeamRating = (roster) => {
  if (!roster || roster.length === 0) return 0
  const sorted = [...roster].sort((a, b) => b.rating - a.rating)
  const top11 = sorted.slice(0, 11)
  const total = top11.reduce((sum, p) => sum + p.rating, 0)
  return Math.round(total / top11.length)
}

export const TeamSelect = ({ teams, onSelect }) => {
  return (
    <div className="team-select-screen">
      <header className="team-select-header">
        <h1>Select Your Nation</h1>
        <p>Choose a team to lead to glory in the Cyber World Cup 2076</p>
      </header>
      
      <div className="teams-grid">
        {teams.map(team => {
          const rating = getTeamRating(team.roster)
          return (
            <button
              key={team.name}
              className="team-card-new"
              style={{ '--team-color': team.color }}
              onClick={() => onSelect(team)}
            >
              <div className="card-flag">{FLAG_EMOJI[team.name] ?? '🏳️'}</div>
              <div className="card-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <h3 className="card-name">{team.name}</h3>
                  <span style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    color: '#fff', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {rating}
                  </span>
                </div>
                {team.country && team.country !== team.name && (
                  <span className="card-country">{team.country}</span>
                )}
                <span className="card-focus">{team.focus}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TeamSelect
