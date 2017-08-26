import { env, logger } from './config/config'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import { ObjectID } from 'mongodb'
import _ from 'lodash'

import './db/mongoose'

import Note from './models/note'
import { User } from './models/user'

const PORT = env.PORT || 8080

const app = express()

app.use(cors())
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

// POST /notes
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

// GET /notes
app.get('/notes', (req, res) => {
  Note.find({}).then(
    notes => {
      res.json({ notes })
    },
    err => {
      res.status(400).send(err)
    }
  )
})

// GET /notes/:id
app.get('/notes/:id', (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Note.findOne({ _id: id })
    .then(note => {
      if (!note) {
        return res.status(404).send()
      }

      res.json({ note })
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

// DELETE /notes/:id
app.delete('/notes/:id', (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Note.findOneAndRemove({ _id: id })
    .then(note => {
      if (!note) {
        return res.status(404).send()
      }
      res.json({ note })
    })
    .catch(e => {
      res.status(400).send()
    })
})

// PATCH /notes/:id
app.patch('/notes/:id', (req, res) => {
  const { id } = req.params
  const body = _.pick(req.body, ['content', 'public'])

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Note.findOneAndUpdate({ _id: id }, { $set: body }, { new: true })
    .then(note => {
      if (!note) {
        return res.status(404).send()
      }

      res.json({ note })
    })
    .catch(e => {
      res.send(400).send()
    })
})

// POST /users
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const user = new User(body)

  user
    .save()
    .then(() => {
      return user.generateAuthToken()
    })
    .then(token => {
      res.header('x-auth', token).send(user)
    })
    .catch(err => res.status(400).send(err))
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export { app }
