function TeamSelect({ teams, onSelect }) {
  return (
    <div className="screen team-select">
      <h1 className="title">SELECT YOUR TEAM</h1>
      <div className="team-grid">
        {teams.map((team) => (
          <div 
            key={team.name} 
            className="team-card"
            style={{ borderColor: team.color }}
            onClick={() => onSelect(team)}
          >
            <h2 style={{ color: team.color }}>{team.name}</h2>
            <p className="country">{team.country}</p>
            <p className="focus">{team.focus}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamSelect
