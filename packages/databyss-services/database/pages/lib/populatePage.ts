import { Page } from '../../../interfaces/Page'
import { DbPage } from '../../interfaces'
import { Selection, DocumentType, Block } from '../../../interfaces'
import { db } from '../../db'
import { getAtomicClosureText } from '../util'

const populatePage = async (_id: string): Promise<Page | null> => {
  const _response = await db.find({
    selector: {
      documentType: DocumentType.Page,
      _id,
    },
  })
  if (_response.docs.length) {
    const _page: DbPage = _response.docs[0]
    console.log('PAGE THAT WAS SAVED', _page)
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
        const _block = _response.docs[0]
        // check for atomic block closure
        if (data.type?.match(/^END_/)) {
          console.log('OVERRRIDE', _block)
          _block.text = {
            textValue: getAtomicClosureText(data.type, _block.text.textValue),
            ranges: [],
          }
          _block.type = data.type
        }

        return _response.docs[0]
      })
    )

    // add to blocks and selection to page
    const _populatedPage: Page = {
      ..._page,
      selection: _selection,
      blocks: _blocks,
    }
    console.log('can get populated', _populatedPage)
    return _populatedPage
  }
  return null
}

export default populatePage
