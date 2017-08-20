import { ObjectID } from 'mongodb'

import Note from './../../models/note'

const noteOneId = new ObjectID()
const noteTwoId = new ObjectID()

const notes = [
  {
    _id: noteOneId,
    content: '# First Note'
  },
  {
    _id: noteTwoId,
    content: '# Second Note'
  }
]

const populateNotes = done => {
  Note.remove({})
    .then(() => {
      return Note.insertMany(notes)
    })
    .then(() => done())
}

export { populateNotes }
