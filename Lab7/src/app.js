import cors from 'cors'
import express from 'express'

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

  app.use((request, response) => {
    response.status(404).json({ error: 'Route not found' })
  })

  return app
}
