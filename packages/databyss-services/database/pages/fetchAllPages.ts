import * as PouchDB from 'pouchdb-browser'
import { MangoResponse, DbPage } from '../interfaces'
import { PageHeader } from '../../interfaces/Page'
import { db } from '../db'
import { initNewPage } from './lib'

export const fetchAllPages = async (): Promise<MangoResponse<PageHeader>> => {
  let _pages: PouchDB.Find.FindResponse<DbPage> = await db.find({
    selector: {
      documentType: 'PAGE',
    },
  })
  if (!_pages.docs.length) {
    // initiate pages
    await initNewPage()
    _pages = await db.find({
      selector: {
        documentType: 'PAGE',
      },
    })
  }
  return _pages
}
