import mongoose from 'mongoose'
import Point from './Point'

const Schema = mongoose.Schema

const SelectionSchema = new Schema({
  anchor: Point,
  focus: Point,
})

const Selection =
  mongoose.models.Selection || mongoose.model('selection', SelectionSchema)

export default Selection
