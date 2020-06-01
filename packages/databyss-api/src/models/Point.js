import mongoose from 'mongoose'

const Point = new mongoose.Schema({
  index: {
    type: Number,
  },
  offset: {
    type: Number,
  },
})

export default Point
