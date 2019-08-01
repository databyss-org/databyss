const mongoose = require('mongoose')

/*
let dbURI =
  process.env.NODE_ENV === 'test'
    ? config.get('mongoURI')
    : config.get('mongoURI')

*/

// const dbURI = process.env.MONGO_URI
const dbURI =
  'mongodb+srv://databyss-api:EUdVPlI6xJQtiWXj@cluster0-zggfn.mongodb.net/test?retryWrites=true&w=majority'
/*
const dbURI =
  process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI

    */

const dB = mongoose

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
const dropDB = () => {
  if (process.env.NODE_ENV === 'test') {
    dB.connection.once('connected', async () => {
      await dB.connection.db.dropDatabase()
      await dB.connection.close()
      await dB.disconnect()
      console.log('MongoDB Disconnected...')
    })
  }
}

module.exports = { connectDB, dropDB }
