const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AccountSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
})

const Account =
  mongoose.models.Account || mongoose.model('account', AccountSchema)

module.exports = Account
