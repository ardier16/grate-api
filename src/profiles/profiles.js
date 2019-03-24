import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.ObjectId,
  name: String,
  birthDate: Date,
  avatarUrl: String,
  status: String,
})

mongoose.model('Profile', ProfileSchema)

export default mongoose.model('Profile')
