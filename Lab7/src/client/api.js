export async function requestToken(role) {
  const response = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })

  return parseResponse(response)
}

export async function listPlants(token, query = {}) {
  const params = new URLSearchParams({
    skip: String(query.skip ?? 0),
    limit: String(query.limit ?? 100),
  })

  if (query.search) {
    params.set('search', query.search)
  }

  return apiRequest(token, `/api/plants?${params}`)
}

export async function createPlant(token, plant) {
  return apiRequest(token, '/api/plants', {
    method: 'POST',
    body: JSON.stringify(plant),
  })
}

export async function updatePlant(token, id, plant) {
  return apiRequest(token, `/api/plants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plant),
  })
}

export async function replacePlants(token, plants) {
  return apiRequest(token, '/api/plants', {
    method: 'PUT',
    body: JSON.stringify({ plants }),
  })
}

export async function waterPlant(token, id) {
  return apiRequest(token, `/api/plants/${id}/water`, { method: 'PATCH' })
}

export async function toggleFavorite(token, id) {
  return apiRequest(token, `/api/plants/${id}/favorite`, { method: 'PATCH' })
}

export async function deletePlant(token, id) {
  return apiRequest(token, `/api/plants/${id}`, { method: 'DELETE' })
}

async function apiRequest(token, path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  return parseResponse(response)
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error || 'API request failed')
  }

  return payload
}
