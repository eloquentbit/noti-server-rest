import { env, logger } from '../config/config'
import mongoose from 'mongoose'

mongoose.Promise = global.Promise
mongoose.connect(env.MONGODB_URI, { useMongoClient: true }).then(
  () => {
    logger.info(`Connected to database at ${env.MONGODB_URI}`)
  },
  err => {
    logger.error(err)
  }
)

export default mongoose
