import { env, logger } from './config/config'

import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import './db/mongoose'

import Note from './models/note'

const PORT = env.PORT || 8080

const app = express()

app.use(
  morgan('dev', {
    skip: () => app.get('env') === 'test'
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({ message: 'Server Ready' })
})

app.post('/notes', (req, res) => {
  const note = new Note({
    content: req.body.content
  })

  note.save().then(
    doc => {
      res.json(doc)
    },
    err => {
      res.status(400).send(err)
    }
  )
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export { app }
