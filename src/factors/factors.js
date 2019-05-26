import mongoose from 'mongoose'

const FactorSchema = new mongoose.Schema({
  name: String,
  locale: String,
  type: Number,
  code: String,
})

mongoose.model('Factor', FactorSchema)

export default mongoose.model('Factor')
