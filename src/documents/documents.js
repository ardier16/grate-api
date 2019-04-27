import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema({
  path: String,
  createdAt: Date,
})

mongoose.model('Document', DocumentSchema)

export default mongoose.model('Document')
