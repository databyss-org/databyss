import { uid } from '@databyss-org/data/lib/uid'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { DocumentType, PageDoc } from '@databyss-org/data/pouchdb/interfaces'
import { Block, BlockType, Page, UNTITLED_PAGE_NAME } from '../interfaces'
import { getAccountFromLocation } from '../session/utils'

export const newPage = (): Page => new Page()

/**
 * Ensures that the text of page.name matches the text of the first entry
 * in the page.blocks. If it doesn't, we add an entry at the beginning of
 * the page and set its text to the page name.
 *
 * @param page Page to ensure
 */
export async function ensureTitleBlock(page: Page) {
  if (page.name === page.blocks[0].text.textValue) {
    return
  }
  if (
    page.name === UNTITLED_PAGE_NAME &&
    page.blocks[0].text.textValue === ''
  ) {
    return
  }

  const _blockId = uid()
  const _titleBlock: Block = {
    _id: _blockId,
    type: BlockType.Entry,
    text: {
      textValue: page.name === UNTITLED_PAGE_NAME ? '' : page.name,
      ranges: [],
    },
  }

  // create a title block
  await dbRef.current!.put({
    ..._titleBlock,
    doctype: DocumentType.Block,
    createdAt: new Date().getTime(),
    belongsToGroup: getAccountFromLocation(),
  })

  // add title block to page document in db
  await dbRef.current!.upsert(page._id, (oldDoc) => {
    const _pageDoc = oldDoc as PageDoc
    _pageDoc.blocks.unshift({
      _id: _blockId,
      type: BlockType.Entry,
    })
    return _pageDoc
  })

  // add title block to Page object
  page.blocks.unshift(_titleBlock)
}
