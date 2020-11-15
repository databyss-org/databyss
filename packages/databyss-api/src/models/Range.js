import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Range = new mongoose.Schema(
  {
    length: {
      type: Number,
    },
    offset: {
      type: Number,
    },
    // example ['bold', 'italic', 'location']
    // takes a string or a tuple
    marks: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    //  _topicId: { type: Schema.Types.ObjectId },
  },
  { _id: false }
)

// TODO: add validator for `marks`
// https://stackoverflow.com/questions/55288944/mongoose-mixed-schema-with-some-required-properties

export default Range
