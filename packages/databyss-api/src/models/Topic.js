const mongoose = require('mongoose')
const RichText = require('./RichText')
const Range = require('./Range')

const Schema = mongoose.Schema

const TopicSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  text: RichText,
  // ranges: [Range],
})

const Topic = mongoose.models.Topic || mongoose.model('topic', TopicSchema)

module.exports = Topic
