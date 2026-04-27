import { HEALTH_OPTIONS, LIGHT_OPTIONS } from '../utils/plants'

function PlantForm({ draft, isEditing, onChange, onSubmit, onCancel }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>{isEditing ? 'Edit plant' : 'Add plant'}</h2>
          <p>Save plant details, care interval, and notes to local storage.</p>
        </div>
      </div>

      <form className="plant-form" onSubmit={onSubmit}>
        <label className="field field-span-2">
          <span>Plant name</span>
          <input name="name" type="text" value={draft.name} onChange={onChange} required />
        </label>

        <label className="field field-span-2">
          <span>Species</span>
          <input name="species" type="text" value={draft.species} onChange={onChange} required />
        </label>

        <label className="field">
          <span>Room</span>
          <input name="room" type="text" value={draft.room} onChange={onChange} required />
        </label>

        <label className="field">
          <span>Light</span>
          <select name="light" value={draft.light} onChange={onChange}>
            {LIGHT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Water every</span>
          <input
            name="wateringInterval"
            type="number"
            min="1"
            max="30"
            value={draft.wateringInterval}
            onChange={onChange}
            required
          />
        </label>

        <label className="field">
          <span>Last watered</span>
          <input name="lastWatered" type="date" value={draft.lastWatered} onChange={onChange} required />
        </label>

        <label className="field field-span-2">
          <span>Health</span>
          <select name="health" value={draft.health} onChange={onChange}>
            {HEALTH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-span-2 field-inline">
          <input name="favorite" type="checkbox" checked={draft.favorite} onChange={onChange} />
          <span>Save this plant as a favorite</span>
        </label>

        <label className="field field-span-2">
          <span>Notes</span>
          <textarea
            name="notes"
            rows="4"
            value={draft.notes}
            onChange={onChange}
            placeholder="Add reminders for misting, rotation, pruning, or recovery."
          />
        </label>

        <div className="form-footer field-span-2">
          <button className="button button-primary" type="submit">
            {isEditing ? 'Save changes' : 'Add plant'}
          </button>
          <button className="button button-secondary" type="button" onClick={onCancel}>
            {isEditing ? 'Cancel edit' : 'Clear form'}
          </button>
        </div>
      </form>

      <div className="aside-actions">
        <p>All changes stay in this browser through localStorage.</p>
      </div>
    </section>
  )
}

export default PlantForm
