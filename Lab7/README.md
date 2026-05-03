# Lab 7 - Plant Care API

This lab adds a back-end REST API for the `plant` entities from Lab 6.

The API is built with Node.js and Express, uses JWT-based authorization, documents endpoints with Swagger UI, supports pagination, and includes a small browser client that talks to the API.

## Run Locally

```bash
npm install
npm run dev
```

Default local server: `http://localhost:3007`

Run the API checks:

```bash
npm test
```

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
- `GET /openapi.json` - raw OpenAPI specification
- `GET /` - small API-backed plant client using `/token` and `/api/plants`

Example token request:

```bash
curl -X POST http://localhost:3007/token \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

Use the returned token as a Bearer token:

```bash
curl http://localhost:3007/api/plants?skip=0\&limit=5 \
  -H "Authorization: Bearer <token>"
```

## Roles and Permissions

- `VISITOR` - `READ`
- `WRITER` - `READ`, `WRITE`
- `ADMIN` - `READ`, `WRITE`, `DELETE`

Tokens expire after `60` seconds to match the demo requirement.

## Project Structure

- `src/auth.js` - JWT issuing, role mapping, permission middleware, 1-minute expiration
- `src/plantRoutes.js` - protected REST endpoints for CRUD and plant actions
- `src/plantStore.js` - in-memory plant store, validation, pagination, search, status-code-friendly errors
- `src/openapi.js` - OpenAPI specification used by Swagger UI
- `public/` - small browser client that requests a JWT and calls the API
- `test/api.test.js` - API tests for auth, permissions, pagination, CRUD, and validation

## Requirement Coverage

- CRUD API for Lab 6 entities: implemented for the `plant` entity at `/api/plants` and `/api/plants/:id`
- JWT-only access for CRUD operations: all plant endpoints require `Authorization: Bearer <token>`
- JWT stores roles/permissions: issued tokens include `role` and `permissions`
- JWT expiration: tokens expire in `60` seconds
- `/token` endpoint: `POST /token` accepts a role or explicit permissions and returns a JWT
- Front-end integration: `GET /` serves a browser client connected to `/token` and `/api/plants`
- API documentation: `GET /docs` serves Swagger UI, and `GET /openapi.json` serves the OpenAPI spec
- Appropriate status codes: routes return `200`, `201`, `204`, `400`, `401`, `403`, and `404` where relevant
- Pagination: `GET /api/plants` supports `skip` and `limit`, plus optional `search` and `room`
- Git history: implementation is split into multiple commits on the `lab7-plant-care-api` branch
