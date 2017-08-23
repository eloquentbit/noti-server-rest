/* eslint-env mocha */
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import expect from 'expect'
import request from 'supertest'
import winston from 'winston'
import { ObjectID } from 'mongodb'

import { app } from './../index'
import Note from './../models/note'
import { notes as testNotes, populateNotes } from './seed/seed'
import { logger } from './../config/config'

logger.remove(winston.transports.Console)

beforeEach(populateNotes)

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
    request(app).post('/notes').send({}).expect(400).end((err, res) => {
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
      .expect(200)
      .expect(res => {
        expect(res.body.notes.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /notes/:id', () => {
  it('should return a note doc', done => {
    request(app)
      .get(`/notes/${testNotes[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.note.content).toBe(testNotes[0].content)
      })
      .end(done)
  })

  it('should return 404 if note is not found', done => {
    const hexId = new ObjectID().toHexString()

    request(app).get(`/notes/${hexId}`).expect(404).end(done)
  })

  it('should return 404 if object id is invalid', done => {
    const invalidID = 'abc'
    request(app).get(`/notes/${invalidID}`).expect(404).end(done)
  })
})

describe('DELETE /notes/:id', () => {
  it('should remove a note', done => {
    const hexId = testNotes[0]._id.toHexString()

    request(app)
      .delete(`/notes/${hexId}`)
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

  it('should return 404 if note not found', done => {
    const hexId = new ObjectID().toHexString()

    request(app).delete(`/notes/${hexId}`).expect(404).end(done)
  })

  it('should return 404 if object id is invalid', done => {
    const invalidID = 'abc'
    request(app).delete(`/notes/${invalidID}`).expect(404).end(done)
  })
})
