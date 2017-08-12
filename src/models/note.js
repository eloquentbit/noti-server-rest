const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  public: {
    type: Boolean,
    default: false
  }
})

const Note = mongoose.model('Note', NoteSchema)

export default Note
