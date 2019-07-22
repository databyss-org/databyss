const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EntrySchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  author: [
    {
      type: String,
    },
  ],
  source: {
    type: String,
  },
  linkedContent: {
    type: String,
  },
  authorId: {
    type: String,
  },
  sourceId: {
    type: String,
  },
  default: {
    type: Boolean,
    default: false,
  },
  /*
  locationType: {
    string default: other
    example: PAGE_RANGE
  },
  locationDesc: {
    string -- default to timestamp 
    free text to add on top of your detail 
    example: 'these are pages'
  }
  locationDetail: {
    object this can be variable JSON object 
    example: pageRange, section, chapter, book, 
  }

  replace page to/page from 

  */

  pageFrom: {
    type: Number,
  },
  pageTo: {
    type: Number,
  },
  files: [
    {
      type: Array,
    },
  ],
  entry: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
  },
  document: {
    type: String,
    requied: true,
  },
})

module.exports = Entry = mongoose.model('entry', EntrySchema)
