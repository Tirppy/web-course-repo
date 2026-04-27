import { LIGHT_OPTIONS, SORT_OPTIONS, STATUS_FILTERS } from '../utils/plants'

function FilterBar({ filters, roomOptions, visibleCount, totalCount, onChange, onReset }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Filters</h2>
          <p>Search the collection and narrow it by room, light, status, or favorites.</p>
        </div>
        <p className="filter-summary">
          Showing {visibleCount} of {totalCount}
        </p>
      </div>

      <div className="filter-grid">
        <label className="field field-search">
          <span>Search</span>
          <input
            name="query"
            type="search"
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="Name, species, room, or notes"
          />
        </label>

        <label className="field">
          <span>Room</span>
          <select value={filters.room} onChange={(event) => onChange('room', event.target.value)}>
            <option value="all">All rooms</option>
            {roomOptions.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Light</span>
          <select value={filters.light} onChange={(event) => onChange('light', event.target.value)}>
            <option value="all">Any light</option>
            {LIGHT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Care status</span>
          <select value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort by</span>
          <select value={filters.sortBy} onChange={(event) => onChange('sortBy', event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-inline field-inline-strong">
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(event) => onChange('favoritesOnly', event.target.checked)}
          />
          <span>Favorites only</span>
        </label>
      </div>

      <div className="filter-actions">
        <button className="button button-secondary" type="button" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </section>
  )
}

export default FilterBar
