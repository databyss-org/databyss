import bugsnagMiddleware from './middleware/bugsnag'

const express = require('express')
const cors = require('cors')
const { connectDB } = require('./config/db')

const app = express()

// Connect Database
connectDB()

// This must be the first piece of middleware in the stack.
// It can only capture errors in downstream middleware
app.use(bugsnagMiddleware.requestHandler)

// Init Middleware
app.use(cors())
app.use(express.json({ extended: false }))

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/pages', require('./routes/api/pages'))

app.use('/api/authors', require('./routes/api/authors'))
app.use('/api/entries', require('./routes/api/entries'))
app.use('/api/sources', require('./routes/api/sources'))
app.use('/api/motifs', require('./routes/api/motifs'))

app.use('/api/documents', require('./routes/api/documents'))

app.use('/api/error', require('./routes/api/error'))

// This handles any errors that Express catches and must be the last middleware
app.use(bugsnagMiddleware.errorHandler)

app.get('/', (req, res) => {
  res.status(200).send('Hello World!')
})

// Serve static assets in production

/*
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}
*/

/*
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

*/
module.exports = app
