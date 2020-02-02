import mongoose from 'mongoose'
import Range from './Range'

const Schema = mongoose.Schema

const LocationSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  text: {
    type: String,
  },
  ranges: [Range],
})

const Location =
  mongoose.models.Location || mongoose.model('location', LocationSchema)

export default Location
