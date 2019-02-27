import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
})

mongoose.model('User', UserSchema)

export default mongoose.model('User')
