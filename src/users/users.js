import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  login: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date,
  name: String,
  birthDate: Date,
  avatarUrl: String,
  status: String,
  lastSeen: Date,
})

mongoose.model('User', UserSchema)

export default mongoose.model('User')
