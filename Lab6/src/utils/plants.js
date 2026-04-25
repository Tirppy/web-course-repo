export const LIGHT_OPTIONS = ['Bright indirect', 'Filtered sun', 'Partial shade', 'Low light']

export const HEALTH_OPTIONS = [
  { value: 'thriving', label: 'Thriving' },
  { value: 'steady', label: 'Steady' },
  { value: 'watch', label: 'Needs attention' },
]

export const STATUS_FILTERS = [
  { value: 'all', label: 'Any care status' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'soon', label: 'Due soon' },
  { value: 'on-track', label: 'On track' },
]

export const SORT_OPTIONS = [
  { value: 'attention', label: 'Attention first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'room', label: 'Room A-Z' },
]

const DEFAULT_WATERING_INTERVAL = 7

const HEALTH_LABELS = {
  thriving: 'Thriving',
  steady: 'Steady',
  watch: 'Needs attention',
}

const HEALTH_VALUES = new Set(HEALTH_OPTIONS.map((option) => option.value))

const STATUS_PRIORITY = {
  overdue: 0,
  today: 1,
  soon: 2,
  'on-track': 3,
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
})

export function getTodayIso() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)

  return formatIsoDate(date)
}

export function createEmptyDraft() {
  return {
    name: '',
    species: '',
    room: '',
    light: LIGHT_OPTIONS[0],
    wateringInterval: String(DEFAULT_WATERING_INTERVAL),
    lastWatered: getTodayIso(),
    health: HEALTH_OPTIONS[0].value,
    favorite: false,
    notes: '',
  }
}

export function createDraftFromPlant(plant) {
  return {
    name: plant.name,
    species: plant.species,
    room: plant.room,
    light: plant.light,
    wateringInterval: String(plant.wateringInterval),
    lastWatered: plant.lastWatered,
    health: plant.health,
    favorite: plant.favorite,
    notes: plant.notes,
  }
}

export function normalizePlant(draft, existingPlant) {
  const normalizedLastWatered = draft.lastWatered || getTodayIso()

  return {
    id: existingPlant?.id ?? createPlantId(),
    name: draft.name.trim(),
    species: draft.species.trim(),
    room: draft.room.trim(),
    light: draft.light,
    wateringInterval: Number(draft.wateringInterval),
    lastWatered: normalizedLastWatered,
    health: draft.health,
    favorite: Boolean(draft.favorite),
    notes: draft.notes.trim(),
    createdAt: existingPlant?.createdAt ?? getTodayIso(),
    history: existingPlant?.history?.length ? existingPlant.history : [normalizedLastWatered],
  }
}

export function getWateringStatus(plant, referenceDate = getTodayIso()) {
  const nextWatering = addDays(plant.lastWatered, plant.wateringInterval)
  const dueInDays = differenceInDays(referenceDate, nextWatering)

  if (dueInDays < 0) {
    return {
      key: 'overdue',
      label: `${Math.abs(dueInDays)} ${Math.abs(dueInDays) === 1 ? 'day' : 'days'} overdue`,
      nextWatering,
      dueInDays,
    }
  }

  if (dueInDays === 0) {
    return {
      key: 'today',
      label: 'Water today',
      nextWatering,
      dueInDays,
    }
  }

  if (dueInDays <= 2) {
    return {
      key: 'soon',
      label: `Due in ${dueInDays} ${dueInDays === 1 ? 'day' : 'days'}`,
      nextWatering,
      dueInDays,
    }
  }

  return {
    key: 'on-track',
    label: `Due in ${dueInDays} days`,
    nextWatering,
    dueInDays,
  }
}

export function sortPlants(plants, sortBy, referenceDate = getTodayIso()) {
  const nextPlants = [...plants]

  if (sortBy === 'name') {
    return nextPlants.sort((first, second) => first.name.localeCompare(second.name))
  }

  if (sortBy === 'room') {
    return nextPlants.sort((first, second) => first.room.localeCompare(second.room))
  }

  if (sortBy === 'newest') {
    return nextPlants.sort((first, second) => second.createdAt.localeCompare(first.createdAt))
  }

  return nextPlants.sort((first, second) => {
    const firstStatus = getWateringStatus(first, referenceDate)
    const secondStatus = getWateringStatus(second, referenceDate)

    if (STATUS_PRIORITY[firstStatus.key] !== STATUS_PRIORITY[secondStatus.key]) {
      return STATUS_PRIORITY[firstStatus.key] - STATUS_PRIORITY[secondStatus.key]
    }

    if (firstStatus.dueInDays !== secondStatus.dueInDays) {
      return firstStatus.dueInDays - secondStatus.dueInDays
    }

    return first.name.localeCompare(second.name)
  })
}

export function matchesSearch(plant, query) {
  const searchableText = [plant.name, plant.species, plant.room, plant.notes].join(' ').toLowerCase()

  return searchableText.includes(query)
}

export function buildActivity(plants) {
  return plants
    .flatMap((plant) =>
      (plant.history ?? []).map((date, index) => ({
        id: `${plant.id}-${date}-${index}`,
        plantName: plant.name,
        room: plant.room,
        date,
      })),
    )
    .sort((first, second) => parseIsoDate(second.date) - parseIsoDate(first.date))
}

export function buildRoomSummaries(plants, referenceDate = getTodayIso()) {
  const summaries = plants.reduce((rooms, plant) => {
    const roomName = plant.room || 'Unassigned'
    const existingRoom = rooms.get(roomName) ?? {
      room: roomName,
      total: 0,
      favorites: 0,
      dueNow: 0,
      thriving: 0,
    }

    const status = getWateringStatus(plant, referenceDate)

    existingRoom.total += 1
    existingRoom.favorites += plant.favorite ? 1 : 0
    existingRoom.thriving += plant.health === 'thriving' ? 1 : 0
    existingRoom.dueNow += status.key === 'overdue' || status.key === 'today' ? 1 : 0

    rooms.set(roomName, existingRoom)

    return rooms
  }, new Map())

  return Array.from(summaries.values()).sort((first, second) => {
    if (first.dueNow !== second.dueNow) {
      return second.dueNow - first.dueNow
    }

    if (first.total !== second.total) {
      return second.total - first.total
    }

    return first.room.localeCompare(second.room)
  })
}

export function buildWeeklyForecast(plants, referenceDate = getTodayIso()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(referenceDate, index)
    const plantNames = plants
      .filter((plant) => {
        if (index === 0) {
          const status = getWateringStatus(plant, referenceDate)
          return status.key === 'overdue' || status.key === 'today'
        }

        return addDays(plant.lastWatered, plant.wateringInterval) === date
      })
      .map((plant) => plant.name)
      .sort((first, second) => first.localeCompare(second))

    return {
      date,
      label: index === 0 ? 'Today' : weekdayFormatter.format(parseIsoDate(date)),
      count: plantNames.length,
      plantNames,
    }
  })
}

export function countRecentLogs(plants, referenceDate = getTodayIso()) {
  return buildActivity(plants).filter((entry) => {
    const daysAgo = differenceInDays(entry.date, referenceDate)
    return daysAgo >= 0 && daysAgo < 7
  }).length
}

export function formatDisplayDate(value) {
  return dateFormatter.format(parseIsoDate(value))
}

export function parseImportedPlants(rawValue) {
  let parsedValue

  try {
    parsedValue = JSON.parse(rawValue)
  } catch {
    throw new Error('Could not parse the selected JSON file.')
  }

  const plants = Array.isArray(parsedValue) ? parsedValue : parsedValue?.plants

  if (!Array.isArray(plants)) {
    throw new Error('Backup file must contain a plants array.')
  }

  const normalizedPlants = plants
    .map((plant, index) => normalizeImportedPlant(plant, index))
    .filter(Boolean)

  if (!normalizedPlants.length) {
    throw new Error('Backup file does not contain any valid plant entries.')
  }

  return sortPlants(normalizedPlants, 'newest')
}

export function getHealthLabel(health) {
  return HEALTH_LABELS[health] ?? 'Steady'
}

function addDays(value, amount) {
  const date = parseIsoDate(value)
  date.setDate(date.getDate() + amount)

  return formatIsoDate(date)
}

function differenceInDays(fromValue, toValue) {
  const fromDate = parseIsoDate(fromValue)
  const toDate = parseIsoDate(toValue)
  const millisecondsInDay = 1000 * 60 * 60 * 24

  return Math.round((toDate - fromDate) / millisecondsInDay)
}

function parseIsoDate(value) {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function formatIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizeImportedPlant(plant, index) {
  if (!plant || typeof plant !== 'object') {
    return null
  }

  const name = normalizeText(plant.name)
  const species = normalizeText(plant.species)
  const room = normalizeText(plant.room)

  if (!name || !species || !room) {
    return null
  }

  const lastWatered = isIsoDateString(plant.lastWatered) ? plant.lastWatered : getTodayIso()
  const createdAt = isIsoDateString(plant.createdAt) ? plant.createdAt : lastWatered
  const interval = Number(plant.wateringInterval)
  const wateringInterval = Number.isFinite(interval)
    ? Math.min(30, Math.max(1, Math.round(interval)))
    : DEFAULT_WATERING_INTERVAL
  const history = Array.isArray(plant.history)
    ? Array.from(new Set([...plant.history.filter(isIsoDateString), lastWatered])).sort((first, second) =>
        first.localeCompare(second),
      )
    : [lastWatered]

  return {
    id: normalizeText(plant.id) || `imported-${index}-${Date.now()}`,
    name,
    species,
    room,
    light: LIGHT_OPTIONS.includes(plant.light) ? plant.light : LIGHT_OPTIONS[0],
    wateringInterval,
    lastWatered,
    health: HEALTH_VALUES.has(plant.health) ? plant.health : 'steady',
    favorite: Boolean(plant.favorite),
    notes: normalizeText(plant.notes),
    createdAt,
    history,
  }
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isIsoDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsedDate = parseIsoDate(value)

  return !Number.isNaN(parsedDate.getTime())
}

function createPlantId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `plant-${Date.now()}-${Math.round(Math.random() * 10000)}`
}
