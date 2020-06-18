import mongoose from 'mongoose'
import RichText from './RichText'

const Schema = mongoose.Schema

const TopicSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  text: RichText.schema,
  pages: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'page',
      },
    },
  ],
})

const Topic = mongoose.models.Topic || mongoose.model('topic', TopicSchema)

export default Topic
