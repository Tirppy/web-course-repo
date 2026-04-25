function BackupPanel({ message, onExport, onImport, onRestoreSamples }) {
  return (
    <section className="panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Backup tools</p>
          <h2>Export the collection to JSON or restore it later without leaving the browser.</h2>
        </div>
        <span className="badge">JSON ready</span>
      </div>

      <div className="backup-actions">
        <button className="button button-primary" type="button" onClick={onExport}>
          Export collection
        </button>

        <label className="button button-secondary button-file">
          Import backup
          <input type="file" accept="application/json,.json" onChange={onImport} />
        </label>
      </div>

      <p className="backup-copy">Use this when you want a portable backup before trying a new layout or device.</p>

      {message ? <p className={`notice notice-${message.type}`}>{message.message}</p> : null}

      <div className="aside-actions">
        <p>Need a quick demo state again? Reload the curated starter collection at any moment.</p>
        <button className="button button-ghost" type="button" onClick={onRestoreSamples}>
          Restore sample collection
        </button>
      </div>
    </section>
  )
}

export default BackupPanel
