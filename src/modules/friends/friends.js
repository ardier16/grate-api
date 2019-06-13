import mongoose from 'mongoose'

const FriendSchema = new mongoose.Schema({
  ownerId: mongoose.Schema.ObjectId,
  participantId: mongoose.Schema.ObjectId,
  state: Number,
  createdAt: Date,
  updatedAt: Date,
})

mongoose.model('Friend', FriendSchema)

export default mongoose.model('Friend')
