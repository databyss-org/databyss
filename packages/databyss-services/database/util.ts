import tv4 from 'tv4'
import { ResourceNotFoundError } from '../interfaces/Errors'
import { db } from './db'
import sourceSchema from '../../databyss-data/schemas/sourceSchema'

export const asyncErrorHandler = (fn: Function): any => async (...args) => {
  try {
    return await fn(...args)
  } catch (err) {
    return new ResourceNotFoundError('database error')
  }
}

// pouchDB validator

db.transform({
  // incoming: (doc) => {
  //   console.log('INCOMING')
  //   // do something to the document before storage
  //   return doc
  // },
  outgoing: (doc) => {
    console.log(doc.type)
    if (doc.type === 'SOURCE') {
      console.log(tv4.validate(doc, sourceSchema))
      console.log('outgoing', doc)
    }
    // do something to the document after retrieval
    return doc
  },
})
