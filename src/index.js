import express from 'express'
import bodyParser from 'body-parser'

const PORT = process.env.PORT || 8080

const app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({ message: 'Server Ready' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
