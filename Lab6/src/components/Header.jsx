import ThemeToggle from './ThemeToggle'

function Header({ theme, onToggle, totalPlants, actionCount, favoriteCount }) {
  const quickStats = [
    { label: 'Tracked plants', value: totalPlants },
    { label: 'Need action', value: actionCount },
    { label: 'Favorites', value: favoriteCount },
  ]

  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Verdant Logbook</p>
        <h1>Keep every watering rhythm, recovery note, and room check in one calm dashboard.</h1>
        <p className="hero-text">
          Plant Care Tracker is a client-side collection manager for houseplants. Add new plants,
          mark watering sessions, favorite the ones you watch closely, and filter the shelf by room,
          light, or care urgency.
        </p>
      </div>

      <div className="hero-actions">
        <div className="hero-highlights">
          {quickStats.map((item) => (
            <article key={item.label} className="hero-pill">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>

        <ThemeToggle theme={theme} onToggle={onToggle} />
      </div>
    </header>
  )
}

export default Header
