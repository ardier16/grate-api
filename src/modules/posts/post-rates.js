import mongoose from 'mongoose'

const PostRateSchema = new mongoose.Schema({
  ownerId: mongoose.Schema.ObjectId,
  postId: mongoose.Schema.ObjectId,
  factorId: mongoose.Schema.ObjectId,
  value: Number,
  createdAt: Date,
  updatedAt: Date,
})

mongoose.model('PostRate', PostRateSchema)

export default mongoose.model('PostRate')
