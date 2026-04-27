function Dashboard({ stats }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Overview</h2>
          <p>Current totals across the saved collection.</p>
        </div>
      </div>

      <div className="stat-list">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-row">
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-detail">{stat.detail}</p>
            </div>
            <h3>{stat.value}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Dashboard
