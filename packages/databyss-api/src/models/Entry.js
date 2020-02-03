import mongoose from 'mongoose'
import RichText from './RichText'

const Schema = mongoose.Schema

const EntrySchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  text: {
    type: RichText.schema,
    default: () => new RichText(),
  },
})

const Entry = mongoose.models.Entry || mongoose.model('entry', EntrySchema)

export default Entry
