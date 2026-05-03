import cors from 'cors'
import express from 'express'
import { issueToken } from './auth.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

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

  app.use((request, response) => {
    response.status(404).json({ error: 'Route not found' })
  })

  return app
}
