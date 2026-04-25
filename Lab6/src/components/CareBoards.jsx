import { formatDisplayDate } from '../utils/plants'

function CareBoards({ agendaPlants, recentActivity }) {
  return (
    <div className="care-grid">
      <section className="panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Next care queue</p>
            <h2>Start with the plants that are closest to their next check.</h2>
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
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2>Review the latest watering history saved in this browser.</h2>
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
