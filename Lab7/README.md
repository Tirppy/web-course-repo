# Lab 7 - Integrated Plant Care API

Lab 7 extends the Lab 6 plant tracker instead of replacing it with a separate demo page.

The Lab 6 React interface was copied into `Lab7/src/client` and is now connected to the Express API in `Lab7/src`. The same plant collection UI is used for creating, editing, watering, favoriting, filtering, importing, exporting, and deleting plants, but the plant data now comes from JWT-protected backend endpoints.

## What Changed From Lab 6

- Lab 6 stored plants in browser `localStorage`.
- Lab 7 stores plants in the backend API's in-memory plant store.
- The React UI still keeps the same layout and styling direction.
- Theme choice remains local to the browser.
- Plant CRUD actions now call `/api/plants` with the active JWT.
- The API access panel lets the user switch between `VISITOR`, `WRITER`, and `ADMIN` tokens.

## Run Locally

Install dependencies:

```bash
npm install
```

Build the integrated React client:

```bash
npm run build
```

Start the API and serve the built client:

```bash
npm start
```

Default local server: `http://localhost:3007`

Run API checks:

```bash
npm test
```

## Useful URLs

- `GET /` - integrated Lab 6-style client backed by the Lab 7 API
- `GET /health` - health check
- `POST /token` - issue a JWT with a 1-minute expiration
- `GET /api/plants?skip=0&limit=20` - paginated plant list, requires `READ`
- `POST /api/plants` - create a plant, requires `WRITE`
- `PUT /api/plants` - replace the collection from a JSON backup, requires `WRITE`
- `PUT /api/plants/:id` - update a plant, requires `WRITE`
- `PATCH /api/plants/:id/water` - log watering, requires `WRITE`
- `PATCH /api/plants/:id/favorite` - toggle favorite, requires `WRITE`
- `DELETE /api/plants/:id` - remove a plant, requires `DELETE`
- `GET /docs` - Swagger UI API documentation
- `GET /openapi.json` - raw OpenAPI specification

## Roles And Permissions

- `VISITOR` - `READ`
- `WRITER` - `READ`, `WRITE`
- `ADMIN` - `READ`, `WRITE`, `DELETE`

Tokens expire after `60` seconds for the demo requirement. When a token expires, request a role again from the API access panel.

## Project Structure

- `src/client` - copied Lab 6 React frontend, adjusted to call the Lab 7 API
- `src/app.js` - Express app setup, API routes, Swagger, and built-client serving
- `src/auth.js` - JWT issuing, role mapping, permission middleware, 1-minute expiration
- `src/plantRoutes.js` - protected REST endpoints for CRUD, backup restore, and plant actions
- `src/plantStore.js` - in-memory plant store, validation, pagination, search, and replacement imports
- `src/openapi.js` - OpenAPI specification used by Swagger UI
- `test/api.test.js` - API tests for auth, permissions, pagination, CRUD, restore, and validation

## Requirement Coverage

- CRUD API for Lab 6 entities: implemented for `plant` entities under `/api/plants`.
- JWT-only access: all plant endpoints require `Authorization: Bearer <token>`.
- JWT roles/permissions: issued tokens include role and permissions.
- JWT expiration: tokens expire in `60` seconds.
- `/token` endpoint: `POST /token` accepts a role or explicit permissions and returns a JWT.
- Frontend integration: the copied Lab 6 React app calls the protected Lab 7 API.
- API documentation: `GET /docs` serves Swagger UI, and `GET /openapi.json` serves the OpenAPI spec.
- Appropriate status codes: routes return `200`, `201`, `204`, `400`, `401`, `403`, and `404` where relevant.
- Pagination: `GET /api/plants` supports `skip` and `limit`, plus optional `search` and `room`.
- Git history: this branch uses multiple commits to show the copy, API integration, and documentation stages.
