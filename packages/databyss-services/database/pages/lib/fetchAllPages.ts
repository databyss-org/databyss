import * as PouchDB from 'pouchdb-browser'
import { PageDoc } from '../../interfaces'
import { db } from '../../db'
import { DocumentType } from '../../../interfaces/Block'
import { ResourceNotFoundError } from '../../../interfaces/Errors'
// import { asyncErrorHandler } from '../../util'

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
// export default asyncErrorHandler(fetchAllPages)
