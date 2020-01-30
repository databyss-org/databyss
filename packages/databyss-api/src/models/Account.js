import mongoose from 'mongoose'
import Page from './Page'

const Schema = mongoose.Schema

const AccountSchema = new Schema({
  name: {
    type: String,
    default: 'default',
  },
  users: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      role: {
        type: String,
      },
    },
  ],
  defaultPage: {
    type: Schema.Types.ObjectId,
    ref: 'page',
  },
})

AccountSchema.static('create', async (values = {}) => {
  const Account = mongoose.model('account', AccountSchema)
  const instance = new Account(values)

  if (!values._id) {
    await instance.save()
  }

  // create default page
  const page = await Page.create({ account: instance._id })
  instance.defaultPageId = page._id
  await instance.save()
  return instance
})

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// updates `users` to set @role for @userId
// adds user if they don't exist
AccountSchema.method('setUserRole', async function({ userId, role }) {
  const _idx = this.users.findIndex(
    user => user._id.toString() === userId.toString()
  )
  if (_idx >= 0) {
    // UPDATE USER PERMISSION
    this.users[_idx].role = role
  } else {
    this.users.push({ _id: userId, role })
  }
  await this.save()
})

module.exports = mongoose.model('account', AccountSchema)
