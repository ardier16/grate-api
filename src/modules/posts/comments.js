import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
  postId: mongoose.Schema.ObjectId,
  ownerId: mongoose.Schema.ObjectId,
  text: String,
  createdAt: Date,
  updatedAt: Date,
})

mongoose.model('Comment', CommentSchema)

export default mongoose.model('Comment')
