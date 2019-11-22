const mongoose = require('mongoose')
const RichText = require('./RichText')

const Schema = mongoose.Schema

const TopicSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  text: RichText,
})

const Topic = mongoose.models.Topic || mongoose.model('topic', TopicSchema)

module.exports = Topic
