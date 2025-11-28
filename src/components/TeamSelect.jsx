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

export const TeamSelect = ({ teams, onSelect }) => {
  return (
    <div className="team-select-screen">
      <header className="team-select-header">
        <h1>Select Your Nation</h1>
        <p>Choose a team to lead to glory in the Cyber World Cup 2077</p>
      </header>
      
      <div className="teams-grid">
        {teams.map(team => (
          <button
            key={team.name}
            className="team-card-new"
            style={{ '--team-color': team.color }}
            onClick={() => onSelect(team)}
          >
            <div className="card-flag">{FLAG_EMOJI[team.name] ?? '🏳️'}</div>
            <div className="card-info">
              <h3 className="card-name">{team.name}</h3>
              {team.country && team.country !== team.name && (
                <span className="card-country">{team.country}</span>
              )}
              <span className="card-focus">{team.focus}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TeamSelect
