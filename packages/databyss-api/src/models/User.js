import mongoose from 'mongoose'
import Account from './Account'

const Schema = mongoose.Schema

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
  },
  password: {
    type: String,
    //   required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  defaultAccount: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
})

UserSchema.static('create', async (values = {}) => {
  const User = mongoose.model('user', UserSchema)
  const instance = User(values)

  // save the user to generate an id
  if (!values._id) {
    await instance.save()
  }

  // create default account
  const account = await Account.create()
  instance.defaultAccount = account._id

  // set user as ADMIN on account
  await account.setUserRole({ userId: instance._id, role: 'ADMIN' })
  await instance.save()
  return instance
})

export default mongoose.model('user', UserSchema)
