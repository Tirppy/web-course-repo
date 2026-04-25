import { useEffect, useState } from 'react'

const samplePlants = [
  {
    name: 'Nova',
    species: 'Monstera deliciosa',
    room: 'Living room',
    status: 'Needs water tomorrow',
  },
  {
    name: 'Piper',
    species: 'Pilea peperomioides',
    room: 'Studio shelf',
    status: 'Healthy and on track',
  },
  {
    name: 'Sage',
    species: 'Snake plant',
    room: 'Bedroom',
    status: 'Low maintenance this week',
  },
]

const highlightCards = [
  {
    eyebrow: 'Collection overview',
    value: '12 plants',
    detail: 'A calm dashboard for rooms, care rhythm, and favorites.',
  },
  {
    eyebrow: 'Today focus',
    value: '3 actions',
    detail: 'Surface the plants that need watering or attention first.',
  },
  {
    eyebrow: 'Saved locally',
    value: 'Browser storage',
    detail: 'Keep the app client-side only with runtime state and local persistence.',
  },
]

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('plant-care-theme')

    if (savedTheme) {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('plant-care-theme', theme)
  }, [theme])

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-left" aria-hidden="true" />
      <div className="backdrop backdrop-right" aria-hidden="true" />

      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Plant Care Tracker</p>
          <h1>Shape a calm care ritual for every plant in your home.</h1>
          <p className="hero-text">
            This first stage sets up the visual direction for the lab: a polished client-side
            dashboard with theme switching, plant cards, and room-based organization.
          </p>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle color theme"
        >
          <span>Theme</span>
          <strong>{theme === 'light' ? 'Dark' : 'Light'}</strong>
        </button>
      </header>

      <main className="content-grid">
        <section className="panel panel-large">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Visual direction</p>
              <h2>Warm paper textures, botanical accents, and quick insights.</h2>
            </div>
            <span className="badge">Scaffold ready</span>
          </div>

          <div className="stats-grid">
            {highlightCards.map((card) => (
              <article key={card.eyebrow} className="stat-card">
                <p className="eyebrow">{card.eyebrow}</p>
                <h3>{card.value}</h3>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Plant shelf</p>
              <h2>Sample cards</h2>
            </div>
          </div>

          <div className="plant-grid">
            {samplePlants.map((plant) => (
              <article key={plant.name} className="plant-card">
                <p className="plant-room">{plant.room}</p>
                <h3>{plant.name}</h3>
                <p className="plant-species">{plant.species}</p>
                <p className="plant-status">{plant.status}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel-accent">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Planned next steps</p>
              <h2>Features to add in the next commits</h2>
            </div>
          </div>

          <ul className="feature-list">
            <li>Add plant creation, editing, removal, and favorite actions.</li>
            <li>Store the collection in localStorage and surface care status filters.</li>
            <li>Document flows in README and prepare the app for GitHub Pages deployment.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
