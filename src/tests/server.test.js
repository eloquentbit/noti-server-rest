/* eslint-env mocha */

const expect = require('expect')
const request = require('supertest')
const winston = require('winston')

const { app } = require('./../index')
const { logger } = require('./../config/config')

logger.remove(winston.transports.Console)

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
