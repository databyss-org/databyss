import mongoose from 'mongoose'

const LoginSchema = new mongoose.Schema({
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

const Login = mongoose.models.Login || mongoose.model('login', LoginSchema)

export default Login
