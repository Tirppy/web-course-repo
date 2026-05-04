import { formatDisplayDate } from '../utils/plants'

function CareBoards({ agendaPlants, recentActivity, weeklyForecast }) {
  return (
    <div className="care-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Next care</h2>
            <p>Plants that are closest to their next watering check.</p>
          </div>
        </div>

        <div className="list-block">
          {agendaPlants.length ? (
            <ul className="agenda-list">
              {agendaPlants.map(({ plant, status }) => (
                <li key={plant.id} className="agenda-item">
                  <div>
                    <strong>{plant.name}</strong>
                    <p>
                      {plant.room} - next check {formatDisplayDate(status.nextWatering)}
                    </p>
                  </div>
                  <span className={`status-pill status-pill-${status.key}`}>{status.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-inline">Everything is comfortably on track for now.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>7-day forecast</h2>
            <p>See how many watering tasks are scheduled across the next week.</p>
          </div>
        </div>

        <div className="forecast-list">
          {weeklyForecast.map((day) => (
            <article
              key={day.date}
              className={`forecast-item ${day.count ? 'is-busy' : ''}`}
              title={day.plantNames.length ? day.plantNames.join(', ') : 'No scheduled watering'}
            >
              <div>
                <strong>{day.label}</strong>
                <p>{formatDisplayDate(day.date)}</p>
              </div>
              <span className="forecast-count">{day.count}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Recent activity</h2>
            <p>Latest watering entries saved in this browser.</p>
          </div>
        </div>

        <div className="list-block">
          {recentActivity.length ? (
            <ul className="activity-list">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="activity-item">
                  <strong>{entry.plantName}</strong>
                  <p>
                    Watered on {formatDisplayDate(entry.date)} in {entry.room}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-inline">Once you log watering events, they will appear here.</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default CareBoards
