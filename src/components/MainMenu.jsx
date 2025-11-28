import './MainMenu.css'

const MainMenu = ({ onPlayNow, onStartWorldCup, onOpenSettings }) => {
  return (
    <div className="main-menu">
      <div className="main-menu__logo">
        <h1>CYBER FOOTBALL</h1>
        <p className="main-menu__tagline">2076 Edition</p>
      </div>
      
      <div className="main-menu__actions">
        <button className="main-menu__btn main-menu__btn--primary" onClick={onPlayNow}>
          Quick Match
        </button>
        <button className="main-menu__btn main-menu__btn--primary" onClick={onStartWorldCup}>
          World Cup
        </button>
        <button className="main-menu__btn" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
      
      <div className="main-menu__footer">
        <p>v0.1.0 • Neon League Systems</p>
      </div>
    </div>
  )
}

export default MainMenu
