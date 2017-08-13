import env from '../config/config'
import mongoose from 'mongoose'

mongoose.Promise = global.Promise
mongoose.connect(env.MONGODB_URI, { useMongoClient: true }).then(
  () => {
    console.log(`Connected to database at ${env.MONGODB_URI}`)
  },
  err => {
    console.error(err)
  }
)

export default mongoose
