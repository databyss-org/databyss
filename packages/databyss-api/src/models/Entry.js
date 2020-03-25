import mongoose from 'mongoose'
import RichText from './RichText'

const Schema = mongoose.Schema

const EntrySchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  page: {
    type: Schema.Types.ObjectId,
    ref: 'page',
    // required: true,
  },
  text: {
    type: RichText.schema,
    default: () => new RichText(),
  },
})

// EntrySchema.index({ 'text.textValue': 'text' })

const Entry = mongoose.models.Entry || mongoose.model('entry', EntrySchema)

export default Entry
