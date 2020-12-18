import * as PouchDB from 'pouchdb-browser'
import { DbPage } from '../../interfaces'
import { db } from '../../db'
import { initNewPage } from '../util'

const fetchAllPages = async (): Promise<DbPage[]> => {
  const _pages: PouchDB.Find.FindResponse<DbPage> = await db.find({
    selector: {
      documentType: 'PAGE',
    },
  })
  return _pages.docs
}

export default fetchAllPages
