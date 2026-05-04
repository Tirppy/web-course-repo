import { useEffect, useMemo, useState } from 'react'
import {
  createPlant,
  deletePlant,
  listPlants,
  replacePlants,
  requestToken,
  toggleFavorite,
  updatePlant,
  waterPlant,
} from './api'
import AuthPanel from './components/AuthPanel'
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
import { saveLocalStorage } from './utils/storage'

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
  const [plants, setPlants] = useState([])
  const [draft, setDraft] = useState(() => createEmptyDraft())
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [backupNotice, setBackupNotice] = useState(null)
  const [token, setToken] = useState('')
  const [tokenInfo, setTokenInfo] = useState({ role: '', permissions: [], expiresIn: 0 })
  const [apiStatus, setApiStatus] = useState('Request an API role to load plants.')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveLocalStorage(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    void handleSelectRole('ADMIN')
  }, [])

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
        label: 'Collection size',
        value: plants.length,
        detail: 'Plant profiles loaded from the protected API.',
      },
      {
        label: 'Needs water',
        value: dueNowCount,
        detail: 'Plants that are overdue or due today.',
      },
      {
        label: 'Thriving',
        value: thrivingCount,
        detail: 'Plants currently marked as thriving.',
      },
      {
        label: 'Recent logs',
        value: countRecentLogs(plants, referenceDate),
        detail: 'Watering entries recorded during the last 7 days.',
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

  const handleSelectRole = async (role) => {
    try {
      setApiStatus(`Requesting ${role} token...`)
      const payload = await requestToken(role)

      setToken(payload.token)
      setTokenInfo({
        role: payload.role,
        permissions: payload.permissions,
        expiresIn: payload.expiresIn,
      })
      setApiStatus(`${payload.role} token loaded. API calls use this role until it expires.`)
      await loadApiPlants(payload.token)
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : 'Could not request an API token.')
    }
  }

  const loadApiPlants = async (activeToken = token) => {
    if (!activeToken) {
      return
    }

    try {
      const payload = await listPlants(activeToken, { limit: 100 })
      setPlants(payload.data)
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : 'Could not load API plants.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const existingPlant = plants.find((plant) => plant.id === editingId)
    const normalizedPlant = normalizePlant(draft, existingPlant)

    try {
      if (existingPlant) {
        const history = new Set(existingPlant.history ?? [])
        history.add(normalizedPlant.lastWatered)

        await updatePlant(token, editingId, {
          ...normalizedPlant,
          history: Array.from(history).sort((first, second) => first.localeCompare(second)),
        })
      } else {
        await createPlant(token, normalizedPlant)
      }

      resetDraft()
      await loadApiPlants()
    } catch (error) {
      setBackupNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not save the plant through the API.',
      })
    }
  }

  const handleEdit = (plant) => {
    setDraft(createDraftFromPlant(plant))
    setEditingId(plant.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRemove = async (id) => {
    const plantToRemove = plants.find((plant) => plant.id === id)

    if (!plantToRemove) {
      return
    }

    if (!window.confirm(`Remove ${plantToRemove.name} from the collection?`)) {
      return
    }

    try {
      await deletePlant(token, id)
      await loadApiPlants()
      if (editingId === id) {
        resetDraft()
      }
    } catch (error) {
      setBackupNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not remove the plant through the API.',
      })
    }
  }

  const handleWater = async (id) => {
    try {
      await waterPlant(token, id)
      await loadApiPlants()
    } catch (error) {
      setBackupNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not log watering through the API.',
      })
    }
  }

  const handleFavorite = async (id) => {
    try {
      await toggleFavorite(token, id)
      await loadApiPlants()
    } catch (error) {
      setBackupNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not update favorite status through the API.',
      })
    }
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

      await replacePlants(token, importedPlants)
      await loadApiPlants()
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

  const handleRestoreSamples = async () => {
    if (window.confirm('Restore the starter collection? This replaces the API plant collection.')) {
      try {
        await replacePlants(token, seedPlants)
        await loadApiPlants()
        handleResetFilters()
        resetDraft()
        setBackupNotice({
          type: 'success',
          message: `Restored ${seedPlants.length} sample plants through the API.`,
        })
      } catch (error) {
        setBackupNotice({
          type: 'error',
          message: error instanceof Error ? error.message : 'Could not restore sample plants through the API.',
        })
      }
    }
  }

  return (
    <div className="app-shell">
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
            <div className="section-heading">
              <div>
                <h2>Plants</h2>
                <p>Review, water, edit, and remove saved plants.</p>
              </div>
              <p className="section-count">{filteredPlants.length} shown</p>
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
          <AuthPanel
            activeRole={tokenInfo.role}
            permissions={tokenInfo.permissions}
            expiresIn={tokenInfo.expiresIn}
            status={apiStatus}
            onSelectRole={handleSelectRole}
          />

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
