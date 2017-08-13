import yenv from 'yenv'
import winston from 'winston'

// Read env file
const env = yenv()

// Configure logger module
const tsFormat = () => new Date().toLocaleTimeString()
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: tsFormat,
      colorize: true
    })
  ]
})

export { env, logger }
