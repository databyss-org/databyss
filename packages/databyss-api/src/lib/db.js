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

const closeDB = async () => {
  await dB.disconnect()
  console.log('database connections closed')
}

// Deletes test database
const dropTestDB = async (newConnection = true) => {
  if (process.env.NODE_ENV === 'test') {
    if (newConnection) {
      await connectDB()
    }
    console.log('Dropping TEST database')
    await dB.connection.dropDatabase()
    if (newConnection) {
      await dB.disconnect()
      console.log('MongoDB Disconnected...')
    }
  }
}

module.exports = { connectDB, dropTestDB, closeDB }
