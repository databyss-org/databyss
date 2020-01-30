const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PageSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },
  name: {
    type: String,
  },
  blocks: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'block',
      },
    },
  ],
})

PageSchema.static('create', async (values = {}) => {
  const Page = mongoose.model('page', PageSchema)
  const instance = new Page(values)
  await instance.save()
  return instance
})

module.exports = mongoose.model('page', PageSchema)
