import { Page } from '../../interfaces/Page'
import { DbPage } from '../interfaces'
import { db } from '../db'
import { Selection, DocumentType, Block } from '../../interfaces'

const populatePage = async (_id: string): Promise<Page | null> => {
  const _response = await db.find({
    selector: {
      documentType: DocumentType.Page,
      _id,
    },
  })
  if (_response.docs.length) {
    const _page: DbPage = _response.docs[0]

    // load selection
    const _selection: Selection = await db.get(_page.selection)

    // load blocks
    const _blocks: Block[] = await Promise.all(
      _page.blocks.map(async (data) => {
        const _response = await db.find({
          selector: {
            documentType: DocumentType.Block,
            _id: data._id,
          },
        })
        return _response.docs[0]
      })
    )

    // add to blocks and selection to page
    const _populatedPage: Page = {
      ..._page,
      selection: _selection,
      blocks: _blocks,
    }

    return _populatedPage
  }
  return null
}

export default populatePage
