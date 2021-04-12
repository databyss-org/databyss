import mongoose from 'mongoose'
// import Page from './Page'
// import Block from './Block'
// import BlockRelation from './BlockRelation'
// import User from './User'
// import { copyPage } from '../lib/pages'

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
  isPublic: {
    type: Boolean,
  },
})

// AccountSchema.static('create', async (values = {}) => {
//   const Account = mongoose.model('account', AccountSchema)
//   const instance = new Account(values)

//   if (!values._id) {
//     await instance.save()
//   }

//   // if env.WELCOME_PAGE_ID is set, copy the welcome page into the new account
//   // and set it as the default page
//   if (process.env.WELCOME_PAGE_ID) {
//     instance.defaultPage = await copyPage({
//       pageId: process.env.WELCOME_PAGE_ID,
//       toAccountId: instance._id,
//     })
//   } else {
//     // otherwise, create empty page and set it as default page
//     const page = await Page.create({ account: instance._id })
//     instance.defaultPage = page._id
//   }
//   await instance.save()
//   return instance
// })

// AccountSchema.post('remove', async (doc) => {
//   console.log(`Account hook [remove]: ${doc._id}`)
//   // delete all Page, Block and BlockRelation records in account
//   await Page.deleteMany({ account: doc._id })
//   await Block.deleteMany({ account: doc._id })
//   await BlockRelation.deleteMany({ account: doc._id })
//   await User.deleteMany({ defaultAccount: doc._id })
// })

// /* eslint-disable prefer-arrow-callback */
// /* eslint-disable func-names */
// // updates `users` to set @role for @userId
// // adds user if they don't exist
// AccountSchema.method('setUserRole', async function ({ userId, role }) {
//   const _idx = this.users.findIndex(
//     (user) => user._id.toString() === userId.toString()
//   )
//   if (_idx >= 0) {
//     // UPDATE USER PERMISSION
//     this.users[_idx].role = role
//   } else {
//     this.users.push({ _id: userId, role })
//   }
//   await this.save()
// })

export default mongoose.model('account', AccountSchema)
