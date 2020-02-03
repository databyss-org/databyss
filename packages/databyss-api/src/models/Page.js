import mongoose from 'mongoose'
import Entry from './Entry'
import Block from './Block'

const Schema = mongoose.Schema

const PageSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },
  name: {
    type: String,
    default: '',
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

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
PageSchema.method('addEntry', async function(values = {}) {
  // add the entry record
  const entry = await Entry.create({
    account: this.account,
    ...values,
  })

  // add the block record
  const block = await Block.create({
    type: 'ENTRY',
    account: this.account,
    entryId: entry._id,
  })
  this.blocks.push({ _id: block._id })

  await this.save()
  return entry
})

PageSchema.static('create', async (values = {}) => {
  const Page = mongoose.model('page', PageSchema)
  const instance = new Page(values)

  // add an empty entry
  instance.addEntry()

  await instance.save()
  return instance
})

export default mongoose.model('page', PageSchema)
