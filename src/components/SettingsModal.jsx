import { invoke } from '@tauri-apps/api/core'

const speedLabels = {
  1: 'Cinematic Broadcast',
  2: 'Balanced Hybrid',
  3: 'Analyst Fast-Forward'
}

const aggressionLabels = ['Calm', 'Calculated', 'Chaotic']

function SettingsModal({ settings, onClose, onChange }) {
  const handleInput = (key) => (event) => {
    const { type, value } = event.target
    const parsedValue = type === 'checkbox'
      ? event.target.checked
      : type === 'range'
        ? Number(value)
        : value
    onChange(key, parsedValue)
  }

  const handleExit = async () => {
    await invoke('exit_app')
  }

  return (
    <div className="settings-overlay">
      <div className="settings-panel" role="dialog" aria-modal="true" aria-label="Settings">
        <header>
          <div>
            <p className="eyebrow">Control Deck</p>
            <h2>Simulation Settings</h2>
            <p className="lead">Prototype controls for the 2076 broadcast build. Most settings persist locally.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="ghost-btn" onClick={handleExit} style={{ borderColor: '#ff4444', color: '#ff4444' }}>Exit Game</button>
            <button className="ghost-btn" onClick={onClose}>Close</button>
          </div>
        </header>

        <section>
          <h3>Match Experience</h3>
          <div className="setting-group">
            <label className="setting">
              <span>Presentation Style</span>
              <select value={settings.presentation} onChange={handleInput('presentation')}>
                <option value="neon">Neon Broadcast</option>
                <option value="hybrid">Hybrid Tactical</option>
                <option value="data">Data Analyst</option>
              </select>
            </label>

            <label className="setting">
              <span>Simulation Speed</span>
              <input type="range" min="1" max="3" value={settings.simSpeed} onChange={handleInput('simSpeed')} />
              <small>{speedLabels[settings.simSpeed]}</small>
            </label>

            <label className="setting toggle">
              <div>
                <span>Cyber Anomalies</span>
                <small>Inject black-market events and spontaneous glitches.</small>
              </div>
              <input type="checkbox" checked={settings.anomalies} onChange={handleInput('anomalies')} />
            </label>
          </div>
        </section>

        <section>
          <h3>AI &amp; Balance</h3>
          <div className="setting-group">
            <label className="setting">
              <span>Difficulty</span>
              <select value={settings.aiDifficulty} onChange={handleInput('aiDifficulty')}>
                <option value="story">Story Mode</option>
                <option value="standard">Standard</option>
                <option value="elite">Elite Ops</option>
              </select>
            </label>

            <label className="setting">
              <span>Aggression Bias</span>
              <input type="range" min="0" max="100" value={settings.aggressionBias} onChange={handleInput('aggressionBias')} />
              <small>{aggressionLabels[Math.round(settings.aggressionBias / 50)] || 'Calculated'}</small>
            </label>

            <label className="setting toggle">
              <div>
                <span>Injury Protocols</span>
                <small>Ultra-real knocks vs. arcade survivability.</small>
              </div>
              <input type="checkbox" checked={settings.injurySimulation} onChange={handleInput('injurySimulation')} />
            </label>
          </div>
        </section>

        <section>
          <h3>Audio &amp; Visuals</h3>
          <div className="setting-group">
            <label className="setting">
              <span>Master Volume</span>
              <input type="range" min="0" max="100" value={settings.masterVolume} onChange={handleInput('masterVolume')} />
            </label>

            <label className="setting">
              <span>FX Volume</span>
              <input type="range" min="0" max="100" value={settings.fxVolume} onChange={handleInput('fxVolume')} />
            </label>

            <label className="setting">
              <span>Interface Scale</span>
              <select value={settings.fontScale} onChange={handleInput('fontScale')}>
                <option value="0.9">Compact</option>
                <option value="1">Standard</option>
                <option value="1.1">Broadcast</option>
              </select>
            </label>

            <label className="setting">
              <span>Palette</span>
              <select value={settings.palette} onChange={handleInput('palette')}>
                <option value="neon">Neon Noir</option>
                <option value="void">Void Core</option>
                <option value="sunrise">Synth Sunrise</option>
              </select>
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsModal
