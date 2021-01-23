import { DocumentType } from './interfaces'
import { dbRef } from './db'
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
  await dbRef.current.upsert(_id, (oldDoc) => {
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
  const _response = await dbRef.current.find({
    selector: {
      ...query,
      $type,
    },
  })
  return _response.docs
}

export const findOne = async ($type: DocumentType, query: any) => {
  const _response = await dbRef.current.find({
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
  const _id = res?._id || uid()
  // replace document
  await upsert({ $type, _id, doc })
}

/*
_local documents do not appear with `find` so a `get` function must be used
*/
export const getUserSession = async () => {
  let response
  try {
    response = await dbRef.current.get('user_preferences')
  } catch (err) {
    console.error('user session not found')
  }
  return response
}
