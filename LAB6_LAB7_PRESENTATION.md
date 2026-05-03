# Lab 6 and Lab 7 Presentation Notes

## Short Introduction

For these two labs, I continued the same project idea across frontend and backend.

Lab 6 is the client-side application: a plant care tracker called `Verdant Logbook`.

Lab 7 is the backend API for the same plant entities. It exposes protected CRUD endpoints, uses JWT authorization, has Swagger documentation, supports pagination, and includes a small API-backed client to demonstrate the connection between frontend and backend.

## How To Present Lab 6

### What To Say

For Lab 6, I built a client-side React application called `Verdant Logbook`. It is a plant care tracker where the main entity is a plant. The user can add, edit, delete, favorite, search, filter, sort, and log watering for plants. The app stores data in `localStorage`, so the data persists after refreshing the page. It also has a custom light and dark theme, room summaries, a care forecast, recent activity, and JSON backup/restore.

### UI Demo Order

1. Open the Lab 6 app.
2. Show the main plant dashboard.
3. Add a new plant using the form.
4. Mark a plant as favorite.
5. Log watering for a plant.
6. Use search and filters.
7. Show sorting and visible plant count.
8. Show the room overview and care forecast.
9. Toggle light/dark theme.
10. Show JSON export/import backup tools.

### Code Walkthrough

Open these files and explain them briefly:

- `Lab6/src/App.jsx` - main React state, CRUD handlers, filters, theme state, `localStorage` persistence
- `Lab6/src/components/PlantForm.jsx` - form for adding and editing plants
- `Lab6/src/components/PlantCard.jsx` - plant card UI and actions like water, edit, favorite, remove
- `Lab6/src/components/FilterBar.jsx` - search, room filter, light filter, status filter, sorting
- `Lab6/src/components/RoomOverview.jsx` - room-level statistics
- `Lab6/src/components/CareBoards.jsx` - next care queue, 7-day forecast, recent activity
- `Lab6/src/components/BackupPanel.jsx` - JSON export/import and sample restore
- `Lab6/src/utils/plants.js` - plant logic, watering status, sorting, search, forecast, import parsing
- `Lab6/src/utils/storage.js` - `localStorage` load/save helpers
- `Lab6/src/styles.css` - custom responsive light/dark UI styling
- `Lab6/README.md` - required app description and user flows

### Lab 6 Requirements Covered

- Client-side only app: implemented with React and browser storage.
- Manipulable entities: plants can be added, edited, removed, favorited, searched, filtered, sorted, and watered.
- Custom theme/style: implemented in CSS with a plant-focused visual style.
- Light/dark mode: theme toggle and persisted theme state.
- Runtime state: React state in `App.jsx`.
- Browser persistence: plants and theme are saved with `localStorage`.
- README flows: documented in `Lab6/README.md`.
- Git history: implemented through multiple commits on a lab branch.
- Public link: handled through GitHub Pages workflow after merge/deployment.

## What Lab 6 Consists Of

Lab 6 consists of a complete frontend application.

The app has plant profiles with fields like name, species, room, light preference, watering interval, last watered date, health, favorite status, and notes.

The main functionality is:

- creating plant profiles
- editing plant profiles
- deleting plants
- marking plants as favorite
- logging watering
- searching plants
- filtering by room, light, care status, and favorites
- sorting plants
- showing room summaries
- showing upcoming care tasks
- showing recent watering activity
- switching between light and dark themes
- saving data locally in the browser
- exporting and importing the plant collection as JSON

## How To Present Lab 7

### What To Say

For Lab 7, I created a backend REST API for the same plant entities from Lab 6. The API is built with Node.js and Express. All CRUD endpoints are protected with JWT authorization. The `/token` endpoint issues demo JWTs with roles and permissions, and the tokens expire after 60 seconds. The API also supports pagination with `skip` and `limit`, uses appropriate HTTP status codes, and is documented with Swagger UI.

The Lab 7 frontend is a small API-backed client served by the backend. It is not meant to replace the Lab 6 app. Its purpose is to demonstrate that the frontend can request a JWT and call protected backend endpoints.

### UI/API Demo Order

1. Start the Lab 7 server.
2. Open `http://localhost:3007`.
3. Explain that this is the API demo client.
4. Click `Visitor`, `Writer`, and `Admin` role buttons.
5. Explain that each role receives a different JWT.
6. Show that `Visitor` has read-only permissions.
7. Use `Admin` or `Writer` to create a plant.
8. Search or paginate the plant list.
9. Use plant actions: water, favorite, delete.
10. Open `http://localhost:3007/docs` and show Swagger documentation.
11. In Swagger, show `/token` and `/api/plants` endpoints.

### Code Walkthrough

Open these files and explain them briefly:

- `Lab7/src/app.js` - Express app setup, middleware, Swagger setup, static client, routes
- `Lab7/src/server.js` - starts the server on port `3007`
- `Lab7/src/auth.js` - JWT creation, roles, permissions, 60-second expiry, permission middleware
- `Lab7/src/plantRoutes.js` - protected REST routes for plants
- `Lab7/src/plantStore.js` - in-memory plant store, validation, search, pagination, CRUD logic
- `Lab7/src/seedPlants.js` - starter plant data
- `Lab7/src/openapi.js` - OpenAPI/Swagger documentation
- `Lab7/public/index.html` - small browser client connected to the API
- `Lab7/public/app.js` - frontend calls to `/token` and `/api/plants`
- `Lab7/public/styles.css` - simple UI styling similar to the Lab 6 direction
- `Lab7/test/api.test.js` - tests for JWT, permissions, pagination, CRUD, and validation
- `Lab7/README.md` - run instructions and requirement coverage

### Lab 7 Requirements Covered

- CRUD API for Lab 6 entities: implemented for `plant` entities under `/api/plants`.
- JWT-only access: all plant routes require `Authorization: Bearer <token>`.
- JWT roles/permissions: tokens contain role and permissions.
- Token expiration: tokens expire after 60 seconds.
- `/token` endpoint: implemented with `POST /token`.
- Frontend integration: `Lab7/public` requests tokens and calls protected API endpoints.
- Swagger documentation: available at `/docs`.
- Appropriate status codes: uses `200`, `201`, `204`, `400`, `401`, `403`, and `404`.
- Pagination: `GET /api/plants` supports `skip` and `limit`.
- Git history: implemented through multiple commits on the Lab 7 branch.

## What Lab 7 Consists Of

Lab 7 consists of a backend API and a small frontend client for demonstration.

The backend contains:

- an Express server
- a `/token` endpoint for issuing JWTs
- role-based permissions
- protected plant CRUD endpoints
- validation for plant input
- in-memory plant storage
- pagination support
- Swagger/OpenAPI documentation
- automated API tests

The API supports these main endpoints:

- `POST /token` - returns a JWT with role/permissions
- `GET /api/plants?skip=0&limit=6` - paginated plant list, requires `READ`
- `GET /api/plants/:id` - get one plant, requires `READ`
- `POST /api/plants` - create plant, requires `WRITE`
- `PUT /api/plants/:id` - update plant, requires `WRITE`
- `PATCH /api/plants/:id/water` - log watering, requires `WRITE`
- `PATCH /api/plants/:id/favorite` - toggle favorite, requires `WRITE`
- `DELETE /api/plants/:id` - delete plant, requires `DELETE`

The demo roles are:

- `VISITOR` - can read plants
- `WRITER` - can read and modify plants
- `ADMIN` - can read, modify, and delete plants

## How To Explain The Missing Login

If asked why there is no login, say this:

The lab requires JWT authorization, not a full user account system. For demonstration, I implemented a `/token` endpoint that issues a short-lived JWT based on a selected role. In a real application, this token endpoint would validate a username and password first. For the lab, the important part is that protected CRUD endpoints only work when the request includes a valid JWT with the required permissions.

## Commands To Show

### Lab 6

```bash
cd Lab6
npm install
npm run dev
```

Build check:

```bash
npm run build
```

### Lab 7

```bash
cd Lab7
npm install
npm run dev
```

Test check:

```bash
npm test
```

Open:

- `http://localhost:3007` - API-backed client
- `http://localhost:3007/docs` - Swagger documentation

## Recommended Presentation Order

1. Explain the common project idea: plant care tracking.
2. Show Lab 6 UI and plant management features.
3. Show Lab 6 code: React state, localStorage, components.
4. Show Lab 7 Swagger documentation.
5. Show Lab 7 API client and JWT roles.
6. Show Lab 7 code: auth, routes, store, docs, tests.
7. Run `npm run build` for Lab 6 or mention it passes.
8. Run `npm test` for Lab 7 or mention all tests pass.
9. Finish by showing git history/branch commits.

## Final Closing Sentence

Lab 6 is the client-side plant tracker, and Lab 7 is the secured backend API for the same plant entities. Together, they show a full flow: frontend entity management, browser persistence, backend CRUD, JWT authorization, API documentation, pagination, tests, and frontend-backend integration.
