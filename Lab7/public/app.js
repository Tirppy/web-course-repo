let token = ''
let skip = 0

const tokenStatus = document.querySelector('#tokenStatus')
const message = document.querySelector('#message')
const plantGrid = document.querySelector('#plantGrid')
const plantForm = document.querySelector('#plantForm')
const searchInput = document.querySelector('#searchInput')
const limitInput = document.querySelector('#limitInput')

document.querySelectorAll('[data-role]').forEach((button) => {
  button.addEventListener('click', () => loadToken(button.dataset.role))
})

document.querySelector('#previousPage').addEventListener('click', () => {
  skip = Math.max(0, skip - Number(limitInput.value))
  loadPlants()
})

document.querySelector('#nextPage').addEventListener('click', () => {
  skip += Number(limitInput.value)
  loadPlants()
})

searchInput.addEventListener('input', () => {
  skip = 0
  loadPlants()
})

limitInput.addEventListener('change', () => {
  skip = 0
  loadPlants()
})

plantForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const formData = new FormData(plantForm)
  const plant = Object.fromEntries(formData.entries())
  plant.wateringInterval = Number(plant.wateringInterval)
  plant.lastWatered = new Date().toISOString().slice(0, 10)

  await apiRequest('/api/plants', {
    method: 'POST',
    body: JSON.stringify(plant),
  })

  plantForm.reset()
  plantForm.elements.wateringInterval.value = '7'
  showMessage('Plant created through the protected API.')
  loadPlants()
})

await loadToken('ADMIN')

async function loadToken(role) {
  const response = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  const data = await response.json()

  token = data.token
  tokenStatus.textContent = `${data.role} token loaded: ${data.permissions.join(', ')}. Expires in ${data.expiresIn} seconds.`
  showMessage(`${data.role} token loaded from /token.`)
  await loadPlants()
}

async function loadPlants() {
  if (!token) {
    return
  }

  const params = new URLSearchParams({
    skip: String(skip),
    limit: limitInput.value,
    search: searchInput.value,
  })
  const payload = await apiRequest(`/api/plants?${params}`)

  renderPlants(payload.data, payload.pagination)
}

async function waterPlant(id) {
  await apiRequest(`/api/plants/${id}/water`, { method: 'PATCH' })
  showMessage('Watering logged through the API.')
  loadPlants()
}

async function favoritePlant(id) {
  await apiRequest(`/api/plants/${id}/favorite`, { method: 'PATCH' })
  showMessage('Favorite status updated through the API.')
  loadPlants()
}

async function deletePlant(id) {
  await apiRequest(`/api/plants/${id}`, { method: 'DELETE' })
  showMessage('Plant deleted through the API.')
  loadPlants()
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    showMessage(data.error || 'API request failed.', true)
    throw new Error(data.error || 'API request failed')
  }

  return data
}

function renderPlants(plants, pagination) {
  plantGrid.innerHTML = ''

  if (!plants.length) {
    plantGrid.innerHTML = '<article class="empty-card">No plants match the current query.</article>'
    return
  }

  plants.forEach((plant) => {
    const card = document.createElement('article')
    card.className = 'plant-card'
    card.innerHTML = `
      <div class="card-header">
        <div>
          <p>${plant.room}</p>
          <h3>${plant.name}</h3>
          <span>${plant.species}</span>
        </div>
        <strong>${plant.favorite ? 'Favorite' : 'Tracked'}</strong>
      </div>
      <dl>
        <div><dt>Light</dt><dd>${plant.light}</dd></div>
        <div><dt>Health</dt><dd>${plant.health}</dd></div>
        <div><dt>Last watered</dt><dd>${plant.lastWatered}</dd></div>
        <div><dt>Interval</dt><dd>${plant.wateringInterval} days</dd></div>
      </dl>
      <p>${plant.notes || 'No notes yet.'}</p>
      <div class="card-actions">
        <button type="button" data-action="water">Water</button>
        <button type="button" data-action="favorite">Favorite</button>
        <button type="button" data-action="delete">Delete</button>
      </div>
    `

    card.querySelector('[data-action="water"]').addEventListener('click', () => waterPlant(plant.id))
    card.querySelector('[data-action="favorite"]').addEventListener('click', () => favoritePlant(plant.id))
    card.querySelector('[data-action="delete"]').addEventListener('click', () => deletePlant(plant.id))
    plantGrid.append(card)
  })

  showMessage(`Showing ${pagination.returned} of ${pagination.total} plants. skip=${pagination.skip}, limit=${pagination.limit}`)
}

function showMessage(text, isError = false) {
  message.hidden = false
  message.textContent = text
  message.classList.toggle('is-error', isError)
}
