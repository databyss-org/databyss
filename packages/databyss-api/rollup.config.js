import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const path = require('path')

export default {
  input: path.resolve(__dirname, './src/app.js'),
  output: {
    dir: path.resolve(__dirname, '../../build/api'),
    format: 'iife',
  },
  plugins: [json(), resolve(), commonjs()],
  inlineDynamicImports: true,
}
