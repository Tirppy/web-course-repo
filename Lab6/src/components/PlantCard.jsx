import { formatDisplayDate, getHealthLabel, getTodayIso } from '../utils/plants'

function PlantCard({ plant, status, onWater, onEdit, onRemove, onToggleFavorite }) {
  const wasWateredToday = plant.lastWatered === getTodayIso()

  return (
    <article className={`plant-card plant-card-live status-${status.key}`}>
      <div className="card-header">
        <div>
          <p className="plant-room">{plant.room}</p>
          <h3>{plant.name}</h3>
          <p className="plant-species">{plant.species}</p>
        </div>

        <button
          className={`favorite-toggle ${plant.favorite ? 'is-active' : ''}`}
          type="button"
          onClick={() => onToggleFavorite(plant.id)}
          aria-pressed={plant.favorite}
        >
          {plant.favorite ? 'Favorited' : 'Favorite'}
        </button>
      </div>

      <div className="badge-row">
        <span className={`status-pill status-pill-${status.key}`}>{status.label}</span>
        <span className={`health-pill health-${plant.health}`}>{getHealthLabel(plant.health)}</span>
      </div>

      <dl className="plant-meta">
        <div>
          <dt>Light</dt>
          <dd>{plant.light}</dd>
        </div>
        <div>
          <dt>Last watered</dt>
          <dd>{formatDisplayDate(plant.lastWatered)}</dd>
        </div>
        <div>
          <dt>Next check</dt>
          <dd>{formatDisplayDate(status.nextWatering)}</dd>
        </div>
        <div>
          <dt>Interval</dt>
          <dd>{plant.wateringInterval} days</dd>
        </div>
        <div>
          <dt>Logs recorded</dt>
          <dd>{plant.history?.length ?? 0}</dd>
        </div>
      </dl>

      {plant.notes ? <p className="plant-note">{plant.notes}</p> : null}

      <div className="card-actions">
        <button className="button button-primary" type="button" onClick={() => onWater(plant.id)}>
          {wasWateredToday ? 'Watered today' : 'Log watering'}
        </button>
        <button className="button button-secondary" type="button" onClick={() => onEdit(plant)}>
          Edit
        </button>
        <button className="button button-danger" type="button" onClick={() => onRemove(plant.id)}>
          Remove
        </button>
      </div>
    </article>
  )
}

export default PlantCard
