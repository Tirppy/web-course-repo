const roles = ['VISITOR', 'WRITER', 'ADMIN']

function AuthPanel({ activeRole, permissions, expiresIn, status, onSelectRole }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>API access</h2>
          <p>{status}</p>
        </div>
      </div>

      <div className="role-grid">
        {roles.map((role) => (
          <button
            key={role}
            className={`button ${activeRole === role ? 'button-primary' : 'button-secondary'}`}
            type="button"
            onClick={() => onSelectRole(role)}
          >
            {role}
          </button>
        ))}
      </div>

      <dl className="token-details">
        <div>
          <dt>Role</dt>
          <dd>{activeRole || 'None'}</dd>
        </div>
        <div>
          <dt>Permissions</dt>
          <dd>{permissions.length ? permissions.join(', ') : 'None'}</dd>
        </div>
        <div>
          <dt>Expires</dt>
          <dd>{expiresIn ? `${expiresIn} seconds` : 'No token'}</dd>
        </div>
      </dl>
    </section>
  )
}

export default AuthPanel
