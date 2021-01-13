import { DocumentType } from './interfaces'
import { db } from './db'
import { uid } from '../lib/uid'

export const addTimeStamp = (doc: any): any => {
  // if document has been created add a modifiedAt timestamp
  if (doc.createdAt) {
    return { ...doc, modifiedAt: Date.now() }
  }
  return { ...doc, createdAt: Date.now() }
}

export const upsert = async ({
  $type,
  _id,
  doc,
}: {
  $type: DocumentType
  _id: string
  doc: any
}) => {
  let _doc
  await db.upsert(_id, (oldDoc) => {
    _doc = {
      ...oldDoc,
      $type,
      ...addTimeStamp({ ...oldDoc, ...doc }),
    }
    return _doc
  })
  return _doc
}

export const findAll = async ($type: DocumentType, query?: any) => {
  const _response = await db.find({
    selector: {
      ...query,
      $type,
    },
  })
  return _response.docs
}

export const findOne = async ($type: DocumentType, query: any) => {
  const _response = await db.find({
    selector: {
      ...query,
      $type,
    },
  })
  if (_response.docs.length) {
    return _response.docs[0]
  }
  return null
}

export const replaceOne = async ({
  $type,
  query,
  doc,
}: {
  $type: DocumentType
  query: any
  doc: any
}) => {
  const res = await findOne($type, query)
  // if document doesnt exit, create a new one
  if (res) {
    console.log('RESPONSE EXISTS', doc)
    console.log('response', res)
  }
  const _id = res?._id || uid()
  // replace document
  await upsert({ $type, _id, doc })
}
