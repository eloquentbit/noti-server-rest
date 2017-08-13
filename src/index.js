import env from './config/config'

import express from 'express'
import bodyParser from 'body-parser'

import db from './db/mongoose'

const PORT = env.PORT || 8080

const app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({ message: 'Server Ready' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
