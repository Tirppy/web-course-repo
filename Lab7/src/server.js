import { createApp } from './app.js'

const port = Number(process.env.PORT) || 3007
const app = createApp()

app.listen(port, () => {
  console.log(`Plant Care API listening on http://localhost:${port}`)
})
