const mongoose = require('mongoose')

const dbURI = process.env.MONGO_URI

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
const dropDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    dB.connect(
      dbURI,
      { useNewUrlParser: true }
    ).then(async () => {
      await dB.connection.db.dropDatabase()
      await dB.connection.close()
      await dB.disconnect()
      console.log('MongoDB Disconnected...')
    })
  }
}

module.exports = { connectDB, dropDB }
