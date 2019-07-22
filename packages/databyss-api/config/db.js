const mongoose = require('mongoose')
//const config = require('config')
require('dotenv').config()

/*
let dbURI =
  process.env.NODE_ENV === 'test'
    ? config.get('mongoURI')
    : config.get('mongoURI')

*/

let dbURI =
  process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI

let dB = mongoose

const connectDB = async () => {
  try {
    await dB.connect(
      dbURI,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    )
    console.log('MongoDB Connected...')
  } catch (err) {
    console.error(err.message)
    // Exit process with failure
    process.exit(1)
  }
}

// Deletes test database
const dropDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    await dB.connection.db.dropDatabase()
    await dB.connection.close()
    await dB.disconnect()
    console.log('MongoDB Disconnected...')
  }
}

module.exports = { connectDB, dropDB }
