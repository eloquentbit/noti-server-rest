/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { env } from './../../config/config'
import { ObjectID } from 'mongodb'
import jwt from 'jsonwebtoken'

import { Note } from './../../models/note'
import { User } from './../../models/user'

const noteOneId = new ObjectID()
const noteTwoId = new ObjectID()

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const notes = [
  {
    _id: noteOneId,
    content: '# First Note',
    _creator: userOneId
  },
  {
    _id: noteTwoId,
    content: '# Second Note',
    _creator: userTwoId
  }
]

const users = [
  {
    _id: userOneId,
    email: 'john@doe.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userOneId, access: 'auth' }, env.JWT_SECRET)
          .toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userTwoId, access: 'auth' }, env.JWT_SECRET)
          .toString()
      }
    ]
  }
]

const populateNotes = done => {
  Note.remove({})
    .then(() => {
      return Note.insertMany(notes)
    })
    .then(() => done())
}

const populateUsers = done => {
  User.remove({})
    .then(() => {
      const userOne = new User(users[0]).save()
      const userTwo = new User(users[1]).save()

      return Promise.all([userOne, userTwo])
    })
    .then(() => done())
}

export { notes, users, populateNotes, populateUsers }
