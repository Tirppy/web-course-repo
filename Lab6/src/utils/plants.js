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

const HEALTH_LABELS = {
  thriving: 'Thriving',
  steady: 'Steady',
  watch: 'Needs attention',
}

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
    wateringInterval: '7',
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

export function countRecentLogs(plants, referenceDate = getTodayIso()) {
  return buildActivity(plants).filter((entry) => {
    const daysAgo = differenceInDays(entry.date, referenceDate)
    return daysAgo >= 0 && daysAgo < 7
  }).length
}

export function formatDisplayDate(value) {
  return dateFormatter.format(parseIsoDate(value))
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

function createPlantId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `plant-${Date.now()}-${Math.round(Math.random() * 10000)}`
}
