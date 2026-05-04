import cors from 'cors'
import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swaggerUi from 'swagger-ui-express'
import { issueToken } from './auth.js'
import { openApiSpec } from './openapi.js'
import { createPlantRouter } from './plantRoutes.js'
import { createPlantStore } from './plantStore.js'
import { seedPlants } from './seedPlants.js'

export function createApp() {
  const app = express()
  const plantStore = createPlantStore(seedPlants)
  const clientDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
  const clientIndex = path.join(clientDirectory, 'index.html')
  const hasBuiltClient = existsSync(clientIndex)

  app.use(cors())
  app.use(express.json())

  if (hasBuiltClient) {
    app.use(express.static(clientDirectory))
  }

  app.get('/openapi.json', (request, response) => {
    response.status(200).json(openApiSpec)
  })

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

  app.get('/health', (request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'plant-care-api',
    })
  })

  app.post('/token', (request, response) => {
    try {
      response.status(201).json(issueToken(request.body))
    } catch (error) {
      response.status(error.statusCode || 500).json({ error: error.message })
    }
  })

  app.use('/api/plants', createPlantRouter(plantStore))

  if (hasBuiltClient) {
    app.get('*', (request, response, next) => {
      if (request.path.startsWith('/api') || request.path === '/openapi.json') {
        return next()
      }

      return response.sendFile(clientIndex)
    })
  }

  app.use((request, response) => {
    response.status(404).json({ error: 'Route not found' })
  })

  app.use((error, request, response, next) => {
    response.status(error.statusCode || 500).json({ error: error.message || 'Internal server error' })
  })

  return app
}
