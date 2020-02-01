import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  school: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const Profile =
  mongoose.models.Profile || mongoose.model('profile', ProfileSchema)

export default Profile
