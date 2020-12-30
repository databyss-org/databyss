import * as PouchDB from 'pouchdb-browser'
import { DbPage } from '../../interfaces'
import { db } from '../../db'
import { DocumentType } from '../../../interfaces/Block'
import { ResourceNotFoundError } from '../../../interfaces/Errors'

const fetchAllPages = async (): Promise<DbPage[] | ResourceNotFoundError> => {
  const _pages: PouchDB.Find.FindResponse<DbPage> = await db.find({
    selector: {
      $type: DocumentType.Page,
    },
  })
  if (!_pages.docs.length) {
    return new ResourceNotFoundError('no pages found')
  }
  return _pages.docs
}

export default fetchAllPages
