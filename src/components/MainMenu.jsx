import './MainMenu.css'

const MainMenu = ({ onPlayNow, onStartWorldCup, onLoadGame, onOpenSettings }) => {
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
        <button className="main-menu__btn" onClick={onLoadGame}>
          Load Game
        </button>
        <button className="main-menu__btn" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
      
      <div className="main-menu__footer">
        <p>v0.1.0 • FatHead Games</p>
      </div>
    </div>
  )
}

export default MainMenu
