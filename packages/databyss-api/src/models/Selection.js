import mongoose from 'mongoose'
import Point from './Point'

const Schema = mongoose.Schema

const SelectionSchema = new Schema({
  anchor: Point,
  focus: Point,
})

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
SelectionSchema.method('create', async function() {
  const Selection = mongoose.model('selection', SelectionSchema)

  // add the selection
  const selection = new Selection({
    anchor: { offset: 0, index: 0 },
    focus: { offset: 0, index: 0 },
  })

  await selection.save()

  console.log('in function', selection)
  return selection
})

// const Selection =
//   mongoose.models.Selection || mongoose.model('selection', SelectionSchema)

// export default Selection
export default mongoose.model('selection', SelectionSchema)
