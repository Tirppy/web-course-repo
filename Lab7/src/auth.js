import jwt from 'jsonwebtoken'

export const PERMISSIONS = ['READ', 'WRITE', 'DELETE']

export const ROLES = {
  ADMIN: ['READ', 'WRITE', 'DELETE'],
  WRITER: ['READ', 'WRITE'],
  VISITOR: ['READ'],
}

const TOKEN_EXPIRES_IN_SECONDS = 60
const TOKEN_EXPIRES_IN = `${TOKEN_EXPIRES_IN_SECONDS}s`
const JWT_SECRET = process.env.JWT_SECRET || 'lab7-local-development-secret'

export function issueToken(input = {}) {
  const role = normalizeRole(input.role)
  const permissions = normalizePermissions(input.permissions, role)

  if (!permissions.length) {
    const error = new Error('At least one valid permission is required')
    error.statusCode = 400
    throw error
  }

  const payload = {
    role,
    permissions,
  }

  return {
    token: jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN }),
    tokenType: 'Bearer',
    expiresIn: TOKEN_EXPIRES_IN_SECONDS,
    role,
    permissions,
  }
}

export function requirePermission(permission) {
  return (request, response, next) => {
    const authHeader = request.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return response.status(401).json({ error: 'Missing Bearer token' })
    }

    try {
      const decoded = jwt.verify(authHeader.slice('Bearer '.length), JWT_SECRET)
      const permissions = Array.isArray(decoded.permissions) ? decoded.permissions : []

      if (!permissions.includes(permission)) {
        return response.status(403).json({ error: `Missing ${permission} permission` })
      }

      request.user = {
        role: decoded.role,
        permissions,
      }

      return next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'Token expired' })
      }

      return response.status(401).json({ error: 'Invalid token' })
    }
  }
}

function normalizeRole(role) {
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : 'VISITOR'

  return ROLES[normalizedRole] ? normalizedRole : 'VISITOR'
}

function normalizePermissions(permissions, role) {
  if (!Array.isArray(permissions)) {
    return ROLES[role]
  }

  return Array.from(
    new Set(
      permissions
        .map((permission) => (typeof permission === 'string' ? permission.toUpperCase() : ''))
        .filter((permission) => PERMISSIONS.includes(permission)),
    ),
  )
}
