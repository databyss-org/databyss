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

  // if email exists, update the User
  let instance = await User.findOne({ email: values.email })
  if (!instance) {
    instance = new User()
  }
  Object.assign(instance, values)

  // save the user here to generate an id
  await instance.save()

  // create default account if it doesn't exist
  if (!instance.defaultAccount) {
    const account = await Account.create()
    instance.defaultAccount = account._id

    // set user as ADMIN on account
    await account.setUserRole({ userId: instance._id, role: 'ADMIN' })
    await instance.save()
  }

  return instance
})

export default mongoose.model('user', UserSchema)
