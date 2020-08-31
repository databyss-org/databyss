import mongoose from 'mongoose'

const dB = mongoose

export const connectDB = async (dbURI = process.env.MONGO_URI) => {
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

export const closeDB = async () => {
  await dB.disconnect()
  console.log('database connections closed')
}

// Deletes test database
export const dropTestDB = async (newConnection = true) => {
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
