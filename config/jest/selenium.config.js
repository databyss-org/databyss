const path = require('path')

module.exports = {
  rootDir: path.join(__dirname, '../../'),
  testEnvironment: 'node',
  transform: {
    '^.+\\.js?$': '<rootDir>/config/jest/babelTransform.js',
  },
  testMatch: ['<rootDir>/**/*.seleniumtest.js'],
}
