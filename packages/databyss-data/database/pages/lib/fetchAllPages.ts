import * as PouchDB from 'pouchdb-browser'
import { DocumentType } from '@databyss-org/services/interfaces/Block'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { PageDoc } from '../../interfaces'
import { db } from '../../db'

const fetchAllPages = async (): Promise<PageDoc[] | ResourceNotFoundError> => {
  const _pages: PouchDB.Find.FindResponse<PageDoc> = await db.find({
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
