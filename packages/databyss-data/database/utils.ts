import { DocumentType } from './interfaces'
import { db } from './db'

export const addTimeStamp = (doc: any): any => {
  // if document has been created add a modifiedAt timestamp
  if (doc.createdAt) {
    return { ...doc, modifiedAt: Date.now() }
  }
  return { ...doc, createdAt: Date.now() }
}

export const upsert = ({
  $type,
  _id,
  doc,
}: {
  $type: DocumentType
  _id: string
  doc: any
}) =>
  db.upsert(_id, (oldDoc) => ({
    ...oldDoc,
    $type,
    ...addTimeStamp({ ...oldDoc, ...doc }),
  }))
