import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { addGroupToDocumentsInPage } from '@databyss-org/data/pouchdb/groups'
import { dbRef } from '../../databyss-data/pouchdb/db'

export const pageDependencyObserver = () => {
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
        addGroupToDocumentsInPage(_pageDoc)
      }
    })
}
