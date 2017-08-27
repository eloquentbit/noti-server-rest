import mongoose from 'mongoose'

const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  public: {
    type: Boolean,
    default: false
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

const Note = mongoose.model('Note', NoteSchema)

export { Note }
