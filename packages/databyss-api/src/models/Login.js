import mongoose from 'mongoose'

const LoginSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  code: {
    type: String,
  },
  token: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

LoginSchema.index({ email: 1, code: 1 }, { unique: true })

const Login = mongoose.models.Login || mongoose.model('login', LoginSchema)

export default Login
