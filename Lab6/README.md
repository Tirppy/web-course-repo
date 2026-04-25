# Verdant Logbook - Plant Care Tracker

Verdant Logbook is a client-side only React app for managing a personal houseplant collection.
It keeps plant data in the browser, helps surface which plants need care next, and offers a custom botanical theme with light and dark modes.
The app also includes room-level insights, a 7-day care forecast, and JSON backup tools so the project goes beyond a basic CRUD list.

## Topic

- Plant care tracking and organization
- Main entity: `plant`
- Secondary entity-like data: watering history saved per plant

## Features

- add a new plant with name, species, room, light preference, watering interval, health status, notes, and favorite flag
- edit existing plant profiles
- remove plants from the collection
- log watering for any plant
- favorite and unfavorite plants
- search by name, species, room, or notes
- filter by room, light, care urgency, and favorite status
- sort plants by urgency, newest, name, or room
- view a dashboard with live collection statistics
- compare rooms by plant count, favorites, thriving plants, and urgent care load
- review a 7-day care forecast for upcoming watering sessions
- view upcoming care items and recent activity history
- export the collection to a JSON backup file
- import a previously exported JSON backup
- switch between custom light and dark themes
- persist collection and theme in `localStorage`

## Main User Flows

### 1. Add a plant

1. Open the plant editor panel.
2. Fill in the plant details.
3. Submit the form.
4. The new plant appears in the collection immediately and stays saved after refresh.

### 2. Track daily care

1. Open the collection or the next care queue.
2. Identify plants that are overdue, due today, or due soon.
3. Click `Log watering` on a plant card.
4. The dashboard, next care date, and recent activity update in runtime.

### 3. Find specific plants quickly

1. Use the search field to match plant name, species, room, or notes.
2. Narrow results with room, light, and care-status filters.
3. Optionally show only favorites or change sorting.

### 4. Update or clean the collection

1. Click `Edit` on a plant card to load it into the form.
2. Save changes to update the stored profile.
3. Click `Remove` to delete a plant from the collection.

### 5. Review room-level care load

1. Open the room overview panel.
2. Compare which rooms have the highest number of plants that need action now.
3. Use that summary to decide where to start a care round.

### 6. Back up or restore the collection

1. Click `Export collection` to download a JSON backup of the saved plants.
2. Use `Import backup` to restore a previously exported file.
3. The imported plants replace the current in-browser collection immediately.

### 7. Keep the experience personalized

1. Toggle between light and dark theme.
2. Refresh the page.
3. The selected theme and saved plants remain available from browser storage.

## State and Persistence

- runtime state is managed with React hooks
- persistent browser state is stored with `localStorage`
- backup and restore happens entirely in the browser through downloaded JSON files
- saved keys:
  - `plant-care-tracker:plants`
  - `plant-care-tracker:theme`

## Tech Stack

- React
- Vite
- plain CSS with custom theme variables and responsive layout

## Run Locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Deployment

The repository contains a GitHub Actions workflow in `.github/workflows/static.yml` that:

- installs dependencies from `Lab6/`
- builds the app with Vite
- deploys `Lab6/dist` to GitHub Pages

After pushing the branch or merging to `master`, the app can be published through GitHub Pages and submitted together with the repository URL and live URL required by the lab.
