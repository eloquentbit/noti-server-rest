/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import { env, logger } from './config/config'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import { ObjectID } from 'mongodb'
import _ from 'lodash'

import './db/mongoose'

import { Note } from './models/note'
import { User } from './models/user'
import { authenticate } from './middleware/authenticate'

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
app.post('/notes', authenticate, (req, res) => {
  const note = new Note({
    content: req.body.content,
    _creator: req.user._id
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
app.get('/notes', authenticate, (req, res) => {
  Note.find({
    _creator: req.user._id
  }).then(
    notes => {
      res.json({ notes })
    },
    err => {
      res.status(400).send(err)
    }
  )
})

// GET /notes/:id
app.get('/notes/:id', authenticate, (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Note.findOne({
    _id: id,
    _creator: req.user._id
  })
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
app.delete('/notes/:id', authenticate, (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Note.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
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
app.patch('/notes/:id', authenticate, (req, res) => {
  const { id } = req.params
  const body = _.pick(req.body, ['content', 'public'])

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Note.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    { $set: body },
    { new: true }
  )
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

// GET /users/me
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

// POST /users/login
app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])

  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header('x-auth', token).send(user)
      })
    })
    .catch(err => res.status(400).send())
})

// DELETE /users/me/token
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => res.status(200).send(), () => res.status(400).send())
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export { app }
