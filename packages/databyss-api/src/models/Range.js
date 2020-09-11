import mongoose from 'mongoose'

const Range = new mongoose.Schema(
  {
    length: {
      type: Number,
    },
    offset: {
      type: Number,
    },
    // example ['bold', 'italic', 'location']
    marks: [
      {
        type: String,
      },
    ],
  },
  { _id: false }
)

export default Range
