import { CouchDb } from '@databyss-org/data/couchdb/couchdb'
import { uid } from '@databyss-org/data/lib/uid'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { Block, BlockType, Page, UNTITLED_PAGE_NAME } from '../interfaces'
import { getAccountFromLocation } from '../session/utils'
import { upsertImmediate } from '@databyss-org/data/pouchdb/utils'

export const newPage = (): Page => new Page()

/**
 * Ensures that the text of page.name matches the text of the first entry
 * in the page.blocks. If it doesn't, we add an entry at the beginning of
 * the page and set its text to the page name.
 *
 * @param page Page to ensure
 */
export async function ensureTitleBlock(page: Page) {
  if (!page.blocks[0]) {
    return
  }
  if (page.name === page.blocks[0].text.textValue) {
    return
  }
  if (
    page.name === UNTITLED_PAGE_NAME &&
    page.blocks[0].text.textValue === '' &&
    page.blocks.length > 1
  ) {
    return
  }

  // add title block to Page object
  const _blockId = uid()
  const _titleBlock: Block = {
    _id: _blockId,
    type: BlockType.Entry,
    text: {
      textValue: page.name === UNTITLED_PAGE_NAME ? '' : page.name,
      ranges: [],
    },
  }
  page.blocks.unshift(_titleBlock)

  if (dbRef.readOnly || dbRef.current instanceof CouchDb) {
    return
  }

  // get pageDoc
  console.log('[ensureTitleBlock] page._id', page._id)
  const _pageDoc = await dbRef.current!.get(page._id)

  // create a title block
  await dbRef.current!.put({
    ..._titleBlock,
    doctype: DocumentType.Block,
    createdAt: new Date().getTime(),
    belongsToGroup: getAccountFromLocation(),
    sharedWithGroups: _pageDoc.sharedWithGroups,
  })

  // add title block to page document in db
  _pageDoc.blocks.unshift({
    _id: _blockId,
    type: BlockType.Entry,
  })

  await upsertImmediate({
    doctype: DocumentType.Page,
    _id: page._id,
    doc: {
      blocks: _pageDoc.blocks,
    },
  })
}
