function BackupPanel({ message, onExport, onImport, onRestoreSamples }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Backup</h2>
          <p>Export the collection to JSON or restore it later.</p>
        </div>
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

      <p className="backup-copy">Use a JSON file when you want a portable copy of the collection.</p>

      {message ? <p className={`notice notice-${message.type}`}>{message.message}</p> : null}

      <div className="aside-actions">
        <p>Restore the sample collection when you want to reset the demo state.</p>
        <button className="button button-ghost" type="button" onClick={onRestoreSamples}>
          Restore sample collection
        </button>
      </div>
    </section>
  )
}

export default BackupPanel
