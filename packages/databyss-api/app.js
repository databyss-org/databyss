const express = require('express')
var cors = require('cors')
const { connectDB } = require('./config/db')

const app = express()

// Connect Database
connectDB()

// Init Middleware
app.use(cors())
app.use(express.json({ extended: false }))

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))

app.use('/api/authors', require('./routes/api/authors'))
app.use('/api/entries', require('./routes/api/entries'))
app.use('/api/sources', require('./routes/api/sources'))
app.use('/api/motifs', require('./routes/api/motifs'))

app.use('/api/documents', require('./routes/api/documents'))

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
