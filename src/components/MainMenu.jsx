function MainMenu({ onPlayNow, onOpenSettings }) {
  return (
    <div className="screen main-menu">
      <div className="menu-hero">
        <p className="eyebrow">Season 2075</p>
        <h1>Cyber Football Manager</h1>
        <p className="lead">
          Command a cult franchise, out-think black-market coaches, and broadcast glory to the orbital fan grid.
        </p>
      </div>

      <div className="menu-actions">
        <button className="menu-card primary" onClick={onPlayNow}>
          <div>
            <span className="card-label">Play Now</span>
            <p className="card-copy">Instant exhibition with bleeding-edge sim logic.</p>
          </div>
          <span className="cta">Launch</span>
        </button>

        <button className="menu-card disabled" disabled title="Career mode enters closed labs soon.">
          <div>
            <span className="card-label">Start Career</span>
            <p className="card-copy">Forge dynasties, negotiate synth contracts, manage egos. Coming soon.</p>
          </div>
          <span className="cta">Locked</span>
        </button>

        <button className="menu-card ghost" onClick={onOpenSettings}>
          <div>
            <span className="card-label">Settings</span>
            <p className="card-copy">Tune presentation, AI hostility, and anomaly frequency.</p>
          </div>
          <span className="cta">Configure</span>
        </button>
      </div>

      <div className="menu-footer">
        <div>
          <p className="subhead">Next up</p>
          <ul>
            <li>🧠 Narrative career arcs + meta-game economy.</li>
            <li>📡 Multiplayer data feeds &amp; holo-broadcast overlays.</li>
            <li>🕶️ Tactical editor for custom cyber augmentations.</li>
          </ul>
        </div>
        <div className="build-tag">
          <span>Build 0.3.0-pre</span>
          <span>"Neon Touchline"</span>
        </div>
      </div>
    </div>
  )
}

export default MainMenu
