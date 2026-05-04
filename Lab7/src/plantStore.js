const LIGHT_OPTIONS = ['Bright indirect', 'Filtered sun', 'Partial shade', 'Low light']
const HEALTH_OPTIONS = ['thriving', 'steady', 'watch']

export function createPlantStore(seedPlants = []) {
  const plants = new Map(seedPlants.map((plant) => [plant.id, { ...plant }]))

  return {
    list(query = {}) {
      const skip = normalizePaginationNumber(query.skip, 0, 0, Number.MAX_SAFE_INTEGER)
      const limit = normalizePaginationNumber(query.limit, 20, 1, 100)
      const search = normalizeText(query.search).toLowerCase()
      const room = normalizeText(query.room)
      const allPlants = Array.from(plants.values()).sort((first, second) =>
        first.name.localeCompare(second.name),
      )
      const filteredPlants = allPlants.filter((plant) => {
        const searchableText = [plant.name, plant.species, plant.room, plant.notes].join(' ').toLowerCase()

        if (search && !searchableText.includes(search)) {
          return false
        }

        if (room && plant.room !== room) {
          return false
        }

        return true
      })

      return {
        data: filteredPlants.slice(skip, skip + limit),
        pagination: {
          total: filteredPlants.length,
          skip,
          limit,
          returned: Math.min(limit, Math.max(filteredPlants.length - skip, 0)),
        },
      }
    },

    replaceAll(inputPlants = []) {
      if (!Array.isArray(inputPlants)) {
        throw createValidationError('plants must be an array')
      }

      const nextPlants = inputPlants.map((plant) => normalizeStoredPlant(plant))

      plants.clear()
      nextPlants.forEach((plant) => plants.set(plant.id, plant))

      return Array.from(plants.values()).sort((first, second) => first.name.localeCompare(second.name))
    },

    get(id) {
      return plants.get(id) ?? null
    },

    create(input) {
      const plant = normalizePlantInput(input)
      plants.set(plant.id, plant)

      return plant
    },

    update(id, input) {
      const existingPlant = plants.get(id)

      if (!existingPlant) {
        return null
      }

      const plant = normalizePlantInput(input, existingPlant)
      plants.set(id, plant)

      return plant
    },

    water(id) {
      const plant = plants.get(id)

      if (!plant) {
        return null
      }

      const today = getTodayIso()
      const history = Array.from(new Set([...(plant.history ?? []), today])).sort((first, second) =>
        first.localeCompare(second),
      )
      const updatedPlant = {
        ...plant,
        lastWatered: today,
        history,
      }

      plants.set(id, updatedPlant)

      return updatedPlant
    },

    toggleFavorite(id) {
      const plant = plants.get(id)

      if (!plant) {
        return null
      }

      const updatedPlant = {
        ...plant,
        favorite: !plant.favorite,
      }

      plants.set(id, updatedPlant)

      return updatedPlant
    },

    remove(id) {
      return plants.delete(id)
    },
  }
}

function normalizeStoredPlant(input = {}) {
  const plant = normalizePlantInput(input)
  const id = normalizeText(input.id) || plant.id

  return {
    ...plant,
    id,
    favorite: Boolean(input.favorite),
    createdAt: isIsoDateString(input.createdAt) ? input.createdAt : plant.createdAt,
  }
}

function normalizePlantInput(input = {}, existingPlant = null) {
  const name = normalizeRequiredText(input.name, 'name')
  const species = normalizeRequiredText(input.species, 'species')
  const room = normalizeRequiredText(input.room, 'room')
  const wateringInterval = Number(input.wateringInterval)
  const lastWatered = isIsoDateString(input.lastWatered) ? input.lastWatered : existingPlant?.lastWatered ?? getTodayIso()

  if (!Number.isFinite(wateringInterval) || wateringInterval < 1 || wateringInterval > 60) {
    throw createValidationError('wateringInterval must be a number from 1 to 60')
  }

  const history = Array.isArray(input.history)
    ? Array.from(new Set([...input.history.filter(isIsoDateString), lastWatered])).sort((first, second) =>
        first.localeCompare(second),
      )
    : existingPlant?.history ?? [lastWatered]

  return {
    id: existingPlant?.id ?? createPlantId(),
    name,
    species,
    room,
    light: LIGHT_OPTIONS.includes(input.light) ? input.light : existingPlant?.light ?? LIGHT_OPTIONS[0],
    wateringInterval: Math.round(wateringInterval),
    lastWatered,
    health: HEALTH_OPTIONS.includes(input.health) ? input.health : existingPlant?.health ?? 'steady',
    favorite: Boolean(input.favorite),
    notes: normalizeText(input.notes),
    createdAt: existingPlant?.createdAt ?? getTodayIso(),
    history,
  }
}

function normalizeRequiredText(value, fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    throw createValidationError(`${fieldName} is required`)
  }

  return normalizedValue
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizePaginationNumber(value, fallbackValue, min, max) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return fallbackValue
  }

  return Math.min(max, Math.max(min, Math.floor(number)))
}

function createValidationError(message) {
  const error = new Error(message)
  error.statusCode = 400

  return error
}

function getTodayIso() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)

  return formatIsoDate(date)
}

function formatIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isIsoDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function createPlantId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `plant-${Date.now()}-${Math.round(Math.random() * 10000)}`
}
