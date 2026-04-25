function Dashboard({ stats }) {
  return (
    <section className="panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Care snapshot</p>
          <h2>See the collection status before you start tending.</h2>
        </div>
        <span className="badge">Live runtime state</span>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.eyebrow} className="stat-card">
            <p className="eyebrow">{stat.eyebrow}</p>
            <h3>{stat.value}</h3>
            <p>{stat.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Dashboard
