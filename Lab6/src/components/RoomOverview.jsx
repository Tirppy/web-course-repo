function RoomOverview({ rooms }) {
  return (
    <section className="panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Room overview</p>
          <h2>Compare which rooms are calm, crowded, or ready for a care round.</h2>
        </div>
        <span className="badge">{rooms.length} rooms</span>
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
