const path = require('path')
const config = require('../databyss-api/webpack.config')

config.entry.app = path.resolve(__dirname, './src/app.js')
module.exports = config
