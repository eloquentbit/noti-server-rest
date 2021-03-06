/* eslint-env mocha */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import expect from 'expect'
import request from 'supertest'
import winston from 'winston'
import { ObjectID } from 'mongodb'

import { app } from './../index'
import { Note } from './../models/note'
import { User } from './../models/user'
import {
  notes as testNotes,
  populateNotes,
  users,
  populateUsers
} from './seed/seed'
import { logger } from './../config/config'

logger.remove(winston.transports.Console)

beforeEach(populateNotes)
beforeEach(populateUsers)

describe('GET /', () => {
  it('should respond with message `Server Ready`', done => {
    request(app)
      .get('/')
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Server Ready')
      })
      .end(done)
  })
})

describe('POST /notes', () => {
  it('should create a new note', done => {
    const content = '# Note title'

    request(app)
      .post('/notes')
      .set('x-auth', users[0].tokens[0].token)
      .send({ content })
      .expect(200)
      .expect(res => {
        expect(res.body.content).toBe(content)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Note.find({ content })
          .then(notes => {
            expect(notes.length).toBe(1)
            expect(notes[0].content).toBe(content)
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should not create a note with invalid body data', done => {
    request(app)
      .post('/notes')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Note.find()
          .then(notes => {
            expect(notes.length).toBe(2)
            done()
          })
          .catch(e => done(e))
      })
  })
})

describe('GET /notes', () => {
  it('should get all notes', done => {
    request(app)
      .get('/notes')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.notes.length).toBe(1)
      })
      .end(done)
  })
})

describe('GET /notes/:id', () => {
  it('should return a note doc', done => {
    request(app)
      .get(`/notes/${testNotes[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.note.content).toBe(testNotes[0].content)
      })
      .end(done)
  })

  it('should not return note created by other user', done => {
    request(app)
      .get(`/notes/${testNotes[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 if note is not found', done => {
    const hexId = new ObjectID().toHexString()

    request(app)
      .get(`/notes/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 if object id is invalid', done => {
    const invalidID = 'abc'
    request(app)
      .get(`/notes/${invalidID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('DELETE /notes/:id', () => {
  it('should remove a note', done => {
    const hexId = testNotes[0]._id.toHexString()

    request(app)
      .delete(`/notes/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.note._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Note.findById(hexId)
          .then(note => {
            expect(note).toNotExist()
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should not remove a note created by other user', done => {
    const hexId = testNotes[0]._id.toHexString()

    request(app)
      .delete(`/notes/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Note.findById(hexId)
          .then(note => {
            expect(note).toExist()
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should return 404 if note not found', done => {
    const hexId = new ObjectID().toHexString()

    request(app)
      .delete(`/notes/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 if object id is invalid', done => {
    const invalidID = 'abc'
    request(app)
      .delete(`/notes/${invalidID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('PATCH /notes/:id', () => {
  it('should update the note', done => {
    const hexId = testNotes[0]._id.toHexString()
    const updatedNote = {
      content: 'Updated content',
      public: true
    }

    request(app)
      .patch(`/notes/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(updatedNote)
      .expect(200)
      .expect(res => {
        expect(res.body.note.content).toBe(updatedNote.content)
        expect(res.body.note.public).toBe(true)
      })
      .end(done)
  })

  it('should not update a note created by other user', done => {
    const hexId = testNotes[0]._id.toHexString()
    const updatedNote = {
      content: '# Content updated'
    }

    request(app)
      .patch(`/notes/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(updatedNote)
      .expect(404)
      .end(done)
  })

  it('should return 404 if object id is invalid', done => {
    const invalidID = 'abc'
    request(app)
      .patch(`/notes/${invalidID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 if note not found', done => {
    const hexId = new ObjectID().toHexString()

    request(app)
      .patch(`/notes/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'example@example.com'
    const password = '123mnb!'

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist()
        expect(res.body._id).toExist()
        expect(res.body.email).toBe(email)
      })
      .end(err => {
        if (err) {
          return done(err)
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toExist()
            expect(user.password).toNotBe(password)
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should return 400 if request is invalid', done => {
    const email = 'invalidemail'
    const password = '123mnb!'

    request(app).post('/users').send({ email, password }).expect(400).end(done)
  })

  it('should not create user if email is in use', done => {
    const email = users[0].email
    const password = 'abc123!'

    request(app).post('/users').send({ email, password }).expect(400).end(done)
  })
})

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[1]).toInclude({
              access: 'auth',
              token: res.headers['x-auth']
            })
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should reject invalid login (wrong password)', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(1)
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should reject invalid login (wrong email)', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email + '1',
        password: users[1].password
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(1)
            done()
          })
          .catch(e => done(e))
      })
  })
})

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0)
            done()
          })
          .catch(e => done(e))
      })
  })
})
