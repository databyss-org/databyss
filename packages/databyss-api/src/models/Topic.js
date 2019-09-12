const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TopicSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  text: {
    type: String,
  },
})

const Topic = mongoose.models.Topic || mongoose.model('topic', TopicSchema)

module.exports = Topic
