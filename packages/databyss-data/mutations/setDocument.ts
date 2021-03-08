import { Document } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { upsert } from '../pouchdb/utils'

export const setDocument = <T extends Document>(
  document: T,
  documentType: DocumentType
) => {
  const _document = { ...document }

  // set field defaults
  if (!_document.successorOf) {
    _document.successorOf = []
  }

  // write document to db
  return upsert({
    _id: document._id,
    doctype: documentType,
    doc: _document,
  })
}
