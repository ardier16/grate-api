import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
})

mongoose.model('User', UserSchema)

export default mongoose.model('User')
