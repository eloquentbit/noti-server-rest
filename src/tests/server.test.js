/* eslint-env mocha */

import expect from 'expect'
import request from 'supertest'
import winston from 'winston'

import { app } from './../index'
import Note from './../models/note'
import { logger } from './../config/config'

logger.remove(winston.transports.Console)

beforeEach(done => {
  Note.remove({}).then(() => done())
})

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
    const content = '# Note title\nFirst note'

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
})
