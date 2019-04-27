import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema({
  url: String,
  createdAt: Date,
})

mongoose.model('Document', DocumentSchema)

export default mongoose.model('Document')
