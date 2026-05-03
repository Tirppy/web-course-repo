# Lab 7 - Plant Care API

This lab adds a back-end REST API for the `plant` entities from Lab 6.

The API is built with Node.js and Express, uses JWT-based authorization, documents endpoints with Swagger UI, supports pagination, and includes a small browser client that talks to the API.

## Run Locally

```bash
npm install
npm run dev
```

Default local server: `http://localhost:3007`

## Useful URLs

- `GET /health` - health check
- `POST /token` - issue a JWT with a 1-minute expiration
- `GET /api/plants?skip=0&limit=20` - paginated plant list, requires `READ`
- `POST /api/plants` - create a plant, requires `WRITE`
- `PUT /api/plants/:id` - update a plant, requires `WRITE`
- `PATCH /api/plants/:id/water` - log watering, requires `WRITE`
- `PATCH /api/plants/:id/favorite` - toggle favorite, requires `WRITE`
- `DELETE /api/plants/:id` - remove a plant, requires `DELETE`
- `GET /docs` - Swagger UI API documentation
- `GET /` - small API-backed plant client

Example token request:

```bash
curl -X POST http://localhost:3007/token \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```
