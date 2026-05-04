import ThemeToggle from './ThemeToggle'

function Header({ theme, onToggle, totalPlants, actionCount, favoriteCount }) {
  const quickStats = [
    { label: 'Tracked plants', value: totalPlants },
    { label: 'Need action', value: actionCount },
    { label: 'Favorites', value: favoriteCount },
  ]

  return (
    <header className="topbar">
      <div className="title-block">
        <h1>Verdant Logbook</h1>
        <p>Track watering schedules, room load, and notes through the Lab 7 API.</p>
      </div>

      <div className="topbar-side">
        <dl className="topbar-stats">
          {quickStats.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <ThemeToggle theme={theme} onToggle={onToggle} />
      </div>
    </header>
  )
}

export default Header
