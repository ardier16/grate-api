import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
  ownerId: mongoose.Schema.ObjectId,
  title: String,
  text: String,
  createdAt: Date,
  updatedAt: Date,
})

mongoose.model('Post', PostSchema)

export default mongoose.model('Post')
