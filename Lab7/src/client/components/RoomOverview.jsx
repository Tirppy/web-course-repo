function RoomOverview({ rooms }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Rooms</h2>
          <p>Compare plant count, urgent care, favorites, and thriving plants by room.</p>
        </div>
        <p className="section-count">{rooms.length} rooms</p>
      </div>

      {rooms.length ? (
        <div className="room-grid">
          {rooms.map((room) => (
            <article key={room.room} className="room-card">
              <div className="room-card-header">
                <strong>{room.room}</strong>
                <span>{room.total} plants</span>
              </div>

              <dl className="room-meta">
                <div>
                  <dt>Need action</dt>
                  <dd>{room.dueNow}</dd>
                </div>
                <div>
                  <dt>Favorites</dt>
                  <dd>{room.favorites}</dd>
                </div>
                <div>
                  <dt>Thriving</dt>
                  <dd>{room.thriving}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-inline">Add a few plants to start seeing room-level summaries.</p>
      )}
    </section>
  )
}

export default RoomOverview
