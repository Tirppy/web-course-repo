import { useEffect, useMemo, useState } from 'react'
import BackupPanel from './components/BackupPanel'
import CareBoards from './components/CareBoards'
import Dashboard from './components/Dashboard'
import FilterBar from './components/FilterBar'
import Header from './components/Header'
import PlantCard from './components/PlantCard'
import PlantForm from './components/PlantForm'
import RoomOverview from './components/RoomOverview'
import { seedPlants } from './data/seedPlants'
import {
  buildActivity,
  buildRoomSummaries,
  buildWeeklyForecast,
  countRecentLogs,
  createDraftFromPlant,
  createEmptyDraft,
  getTodayIso,
  getWateringStatus,
  matchesSearch,
  normalizePlant,
  parseImportedPlants,
  sortPlants,
} from './utils/plants'
import { loadLocalStorage, saveLocalStorage } from './utils/storage'

const PLANT_STORAGE_KEY = 'plant-care-tracker:plants'
const THEME_STORAGE_KEY = 'plant-care-tracker:theme'

const defaultFilters = {
  query: '',
  room: 'all',
  light: 'all',
  status: 'all',
  favoritesOnly: false,
  sortBy: 'attention',
}

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [plants, setPlants] = useState(() => loadLocalStorage(PLANT_STORAGE_KEY, seedPlants))
  const [draft, setDraft] = useState(() => createEmptyDraft())
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [backupNotice, setBackupNotice] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveLocalStorage(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    saveLocalStorage(PLANT_STORAGE_KEY, plants)
  }, [plants])

  const referenceDate = getTodayIso()

  const roomOptions = useMemo(
    () => Array.from(new Set(plants.map((plant) => plant.room))).sort((first, second) => first.localeCompare(second)),
    [plants],
  )

  const dueNowCount = useMemo(
    () =>
      plants.filter((plant) => {
        const status = getWateringStatus(plant, referenceDate)
        return status.key === 'overdue' || status.key === 'today'
      }).length,
    [plants, referenceDate],
  )

  const thrivingCount = useMemo(
    () => plants.filter((plant) => plant.health === 'thriving').length,
    [plants],
  )

  const favoriteCount = useMemo(
    () => plants.filter((plant) => plant.favorite).length,
    [plants],
  )

  const roomSummaries = useMemo(
    () => buildRoomSummaries(plants, referenceDate),
    [plants, referenceDate],
  )

  const stats = useMemo(
    () => [
      {
        eyebrow: 'Collection size',
        value: plants.length,
        detail: 'Saved plant profiles available after refresh in this browser.',
      },
      {
        eyebrow: 'Needs water',
        value: dueNowCount,
        detail: 'Plants that are overdue or scheduled for watering today.',
      },
      {
        eyebrow: 'Thriving',
        value: thrivingCount,
        detail: 'Plants currently marked as healthy and stable.',
      },
      {
        eyebrow: 'Recent logs',
        value: countRecentLogs(plants, referenceDate),
        detail: 'Watering events recorded during the last 7 days.',
      },
    ],
    [dueNowCount, plants, referenceDate, thrivingCount],
  )

  const filteredPlants = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return sortPlants(
      plants.filter((plant) => {
        const status = getWateringStatus(plant, referenceDate)

        if (query && !matchesSearch(plant, query)) {
          return false
        }

        if (filters.room !== 'all' && plant.room !== filters.room) {
          return false
        }

        if (filters.light !== 'all' && plant.light !== filters.light) {
          return false
        }

        if (filters.status !== 'all' && status.key !== filters.status) {
          return false
        }

        if (filters.favoritesOnly && !plant.favorite) {
          return false
        }

        return true
      }),
      filters.sortBy,
      referenceDate,
    )
  }, [filters, plants, referenceDate])

  const agendaPlants = useMemo(
    () =>
      sortPlants(
        plants.filter((plant) => getWateringStatus(plant, referenceDate).dueInDays <= 3),
        'attention',
        referenceDate,
      )
        .slice(0, 5)
        .map((plant) => ({
          plant,
          status: getWateringStatus(plant, referenceDate),
        })),
    [plants, referenceDate],
  )

  const recentActivity = useMemo(() => buildActivity(plants).slice(0, 6), [plants])

  const weeklyForecast = useMemo(
    () => buildWeeklyForecast(plants, referenceDate),
    [plants, referenceDate],
  )

  const handleDraftChange = (event) => {
    const { name, value, type, checked } = event.target

    setDraft((currentDraft) => ({
      ...currentDraft,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetDraft = () => {
    setDraft(createEmptyDraft())
    setEditingId(null)
  }

  const handleResetFilters = () => {
    setFilters({ ...defaultFilters })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const existingPlant = plants.find((plant) => plant.id === editingId)
    const normalizedPlant = normalizePlant(draft, existingPlant)

    if (existingPlant) {
      const history = new Set(existingPlant.history ?? [])
      history.add(normalizedPlant.lastWatered)

      setPlants((currentPlants) =>
        currentPlants.map((plant) =>
          plant.id === editingId
            ? {
                ...normalizedPlant,
                history: Array.from(history).sort((first, second) => first.localeCompare(second)),
              }
            : plant,
        ),
      )
    } else {
      setPlants((currentPlants) => [normalizedPlant, ...currentPlants])
    }

    resetDraft()
  }

  const handleEdit = (plant) => {
    setDraft(createDraftFromPlant(plant))
    setEditingId(plant.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRemove = (id) => {
    const plantToRemove = plants.find((plant) => plant.id === id)

    if (!plantToRemove) {
      return
    }

    if (window.confirm(`Remove ${plantToRemove.name} from the collection?`)) {
      setPlants((currentPlants) => currentPlants.filter((plant) => plant.id !== id))

      if (editingId === id) {
        resetDraft()
      }
    }
  }

  const handleWater = (id) => {
    const today = getTodayIso()

    setPlants((currentPlants) =>
      currentPlants.map((plant) => {
        if (plant.id !== id) {
          return plant
        }

        const history = new Set(plant.history ?? [])
        history.add(today)

        return {
          ...plant,
          lastWatered: today,
          history: Array.from(history).sort((first, second) => first.localeCompare(second)),
        }
      }),
    )
  }

  const handleFavorite = (id) => {
    setPlants((currentPlants) =>
      currentPlants.map((plant) =>
        plant.id === id
          ? {
              ...plant,
              favorite: !plant.favorite,
            }
          : plant,
      ),
    )
  }

  const handleFilterChange = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      plants,
    }
    const fileName = `verdant-logbook-backup-${referenceDate}.json`
    const downloadUrl = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    )
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = fileName
    document.body.append(link)
    link.click()
    link.remove()

    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
    setBackupNotice({
      type: 'success',
      message: `Exported ${plants.length} plants to ${fileName}.`,
    })
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const importedPlants = parseImportedPlants(await file.text())

      setPlants(importedPlants)
      handleResetFilters()
      resetDraft()
      setBackupNotice({
        type: 'success',
        message: `Imported ${importedPlants.length} plants from ${file.name}.`,
      })
    } catch (error) {
      setBackupNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not import the selected backup.',
      })
    }
  }

  const handleRestoreSamples = () => {
    if (window.confirm('Restore the starter collection? This replaces the saved plants in this browser.')) {
      setPlants(seedPlants)
      handleResetFilters()
      resetDraft()
      setBackupNotice({
        type: 'success',
        message: `Restored ${seedPlants.length} sample plants for the demo collection.`,
      })
    }
  }

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-left" aria-hidden="true" />
      <div className="backdrop backdrop-right" aria-hidden="true" />

      <Header
        theme={theme}
        onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        totalPlants={plants.length}
        actionCount={dueNowCount}
        favoriteCount={favoriteCount}
      />

      <main className="workspace">
        <div className="workspace-main stack">
          <Dashboard stats={stats} />

          <RoomOverview rooms={roomSummaries} />

          <FilterBar
            filters={filters}
            roomOptions={roomOptions}
            visibleCount={filteredPlants.length}
            totalCount={plants.length}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          <section className="panel collection-panel">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow">Plant collection</p>
                <h2>Manage the whole shelf with actions, notes, and care status badges.</h2>
              </div>
              <span className="badge">{filteredPlants.length} visible</span>
            </div>

            {filteredPlants.length ? (
              <div className="plant-grid plant-grid-live">
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    status={getWateringStatus(plant, referenceDate)}
                    onWater={handleWater}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                    onToggleFavorite={handleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No plants match the current filters.</h3>
                <p>Reset the filters or restore the sample collection to see the dashboard fill up again.</p>
                <button className="button button-secondary" type="button" onClick={handleResetFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="workspace-aside stack">
          <PlantForm
            draft={draft}
            isEditing={Boolean(editingId)}
            onChange={handleDraftChange}
            onSubmit={handleSubmit}
            onCancel={resetDraft}
          />

          <BackupPanel
            message={backupNotice}
            onExport={handleExport}
            onImport={handleImport}
            onRestoreSamples={handleRestoreSamples}
          />

          <CareBoards
            agendaPlants={agendaPlants}
            recentActivity={recentActivity}
            weeklyForecast={weeklyForecast}
          />
        </aside>
      </main>
    </div>
  )
}

export default App
