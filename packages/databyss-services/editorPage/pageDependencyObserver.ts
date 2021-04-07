import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { addGroupToDocumentsFromPage } from '@databyss-org/data/pouchdb/groups'
import { CouchDb } from '@databyss-org/data/couchdb-client/couchdb'
import { dbRef } from '../../databyss-data/pouchdb/db'

export const pageDependencyObserver = () => {
  if (dbRef.current instanceof CouchDb) {
    return
  }
  dbRef.current
    ?.changes({
      since: 'now',
      live: true,
      include_docs: true,
      selector: { doctype: DocumentType.Page },
    })
    .on('change', (change) => {
      // crawl page and add property to all pages
      const _pageDoc = change.doc

      if (_pageDoc?.sharedWithGroups?.length) {
        addGroupToDocumentsFromPage(_pageDoc)
      }
    })
}
