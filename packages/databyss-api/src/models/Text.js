import mongoose from 'mongoose'

const TextSchema = new mongoose.Schema({
  textValue: { type: String, default: '' },
})

const Text = mongoose.models.Text || mongoose.model('text', TextSchema)

export default Text
