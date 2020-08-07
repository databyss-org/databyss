const path = require('path')
const config = require('../databyss-api/webpack.config')

config.entry.app = path.resolve(__dirname, './src/app.js')
config.output.path = path.resolve(__dirname, '../../build/pdf-api')
config.externals = /pdfjs-dist/
module.exports = config
