import assert from 'node:assert/strict'
import test from 'node:test'
import request from 'supertest'
import { createApp } from '../src/app.js'

test('health endpoint returns service status', async () => {
  const app = createApp()

  const response = await request(app).get('/health').expect(200)

  assert.equal(response.body.status, 'ok')
  assert.equal(response.body.service, 'plant-care-api')
})

test('protected endpoints reject requests without a JWT', async () => {
  const app = createApp()

  const response = await request(app).get('/api/plants').expect(401)

  assert.equal(response.body.error, 'Missing Bearer token')
})

test('visitor token can read paginated data but cannot write', async () => {
  const app = createApp()
  const token = await tokenFor(app, 'VISITOR')

  const listResponse = await request(app)
    .get('/api/plants?skip=1&limit=1')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  assert.equal(listResponse.body.pagination.skip, 1)
  assert.equal(listResponse.body.pagination.limit, 1)
  assert.equal(listResponse.body.pagination.returned, 1)

  const writeResponse = await request(app)
    .post('/api/plants')
    .set('Authorization', `Bearer ${token}`)
    .send(makePlantPayload())
    .expect(403)

  assert.equal(writeResponse.body.error, 'Missing WRITE permission')
})

test('admin token can create, read, update, water, favorite, and delete plants', async () => {
  const app = createApp()
  const token = await tokenFor(app, 'ADMIN')
  const authHeader = { Authorization: `Bearer ${token}` }

  const createResponse = await request(app)
    .post('/api/plants')
    .set(authHeader)
    .send(makePlantPayload())
    .expect(201)

  assert.match(createResponse.headers.location, /^\/api\/plants\//)
  assert.equal(createResponse.body.data.name, 'Test Fern')

  const id = createResponse.body.data.id

  const readResponse = await request(app).get(`/api/plants/${id}`).set(authHeader).expect(200)
  assert.equal(readResponse.body.data.id, id)

  const updateResponse = await request(app)
    .put(`/api/plants/${id}`)
    .set(authHeader)
    .send({ ...makePlantPayload(), room: 'Kitchen' })
    .expect(200)
  assert.equal(updateResponse.body.data.room, 'Kitchen')

  const waterResponse = await request(app).patch(`/api/plants/${id}/water`).set(authHeader).expect(200)
  assert.ok(waterResponse.body.data.history.includes(waterResponse.body.data.lastWatered))

  const favoriteResponse = await request(app).patch(`/api/plants/${id}/favorite`).set(authHeader).expect(200)
  assert.equal(favoriteResponse.body.data.favorite, true)

  await request(app).delete(`/api/plants/${id}`).set(authHeader).expect(204)
  await request(app).get(`/api/plants/${id}`).set(authHeader).expect(404)
})

test('writer token can replace the collection from a client backup', async () => {
  const app = createApp()
  const token = await tokenFor(app, 'WRITER')
  const authHeader = { Authorization: `Bearer ${token}` }
  const replacementPlants = [
    {
      id: 'restored-plant',
      name: 'Restored Plant',
      species: 'Ficus elastica',
      room: 'Hallway',
      light: 'Filtered sun',
      wateringInterval: 9,
      lastWatered: '2026-05-01',
      health: 'thriving',
      favorite: true,
      notes: 'Restored from an exported client backup.',
      createdAt: '2026-04-12',
      history: ['2026-04-22', '2026-05-01'],
    },
  ]

  const replaceResponse = await request(app)
    .put('/api/plants')
    .set(authHeader)
    .send({ plants: replacementPlants })
    .expect(200)

  assert.equal(replaceResponse.body.data.length, 1)
  assert.equal(replaceResponse.body.data[0].id, 'restored-plant')

  const listResponse = await request(app).get('/api/plants').set(authHeader).expect(200)

  assert.equal(listResponse.body.pagination.total, 1)
  assert.equal(listResponse.body.data[0].name, 'Restored Plant')
})

test('invalid plant payload returns a validation status code', async () => {
  const app = createApp()
  const token = await tokenFor(app, 'WRITER')

  const response = await request(app)
    .post('/api/plants')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: '', wateringInterval: 0 })
    .expect(400)

  assert.equal(response.body.error, 'name is required')
})

async function tokenFor(app, role) {
  const response = await request(app).post('/token').send({ role }).expect(201)

  assert.equal(response.body.expiresIn, 60)
  assert.ok(response.body.token)

  return response.body.token
}

function makePlantPayload() {
  return {
    name: 'Test Fern',
    species: 'Nephrolepis exaltata',
    room: 'Bathroom',
    light: 'Bright indirect',
    wateringInterval: 5,
    lastWatered: '2026-05-03',
    health: 'steady',
    favorite: false,
    notes: 'Created by an automated API test.',
  }
}
