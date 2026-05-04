import { Router } from 'express'
import { requirePermission } from './auth.js'

export function createPlantRouter(plantStore) {
  const router = Router()

  router.get('/', requirePermission('READ'), (request, response) => {
    response.status(200).json(plantStore.list(request.query))
  })

  router.get('/:id', requirePermission('READ'), (request, response) => {
    const plant = plantStore.get(request.params.id)

    if (!plant) {
      return response.status(404).json({ error: 'Plant not found' })
    }

    return response.status(200).json({ data: plant })
  })

  router.post('/', requirePermission('WRITE'), (request, response, next) => {
    try {
      const plant = plantStore.create(request.body)
      response.location(`/api/plants/${plant.id}`).status(201).json({ data: plant })
    } catch (error) {
      next(error)
    }
  })

  router.put('/', requirePermission('WRITE'), (request, response, next) => {
    try {
      const plants = plantStore.replaceAll(request.body?.plants)
      response.status(200).json({ data: plants })
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', requirePermission('WRITE'), (request, response, next) => {
    try {
      const plant = plantStore.update(request.params.id, request.body)

      if (!plant) {
        return response.status(404).json({ error: 'Plant not found' })
      }

      return response.status(200).json({ data: plant })
    } catch (error) {
      return next(error)
    }
  })

  router.patch('/:id/water', requirePermission('WRITE'), (request, response) => {
    const plant = plantStore.water(request.params.id)

    if (!plant) {
      return response.status(404).json({ error: 'Plant not found' })
    }

    return response.status(200).json({ data: plant })
  })

  router.patch('/:id/favorite', requirePermission('WRITE'), (request, response) => {
    const plant = plantStore.toggleFavorite(request.params.id)

    if (!plant) {
      return response.status(404).json({ error: 'Plant not found' })
    }

    return response.status(200).json({ data: plant })
  })

  router.delete('/:id', requirePermission('DELETE'), (request, response) => {
    const wasDeleted = plantStore.remove(request.params.id)

    if (!wasDeleted) {
      return response.status(404).json({ error: 'Plant not found' })
    }

    return response.status(204).send()
  })

  return router
}
