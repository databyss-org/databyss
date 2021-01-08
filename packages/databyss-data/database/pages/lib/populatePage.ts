import { Page } from '@databyss-org/services/interfaces/Page'
import {
  Selection,
  DocumentType,
  Block,
} from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { PageDoc } from '../../interfaces'
import { db } from '../../db'
import { getAtomicClosureText } from '../util'

const populatePage = async (
  _id: string
): Promise<Page | ResourceNotFoundError> => {
  // TODO: wrap function in error handler
  const _response = await db.find({
    selector: {
      $type: DocumentType.Page,
      _id,
    },
  })

  if (!_response.docs.length) {
    return new ResourceNotFoundError('page not found')
  }
  const _page: PageDoc = _response.docs[0]
  // load selection
  const _selection: Selection = await db.get(_page.selection)

  // load blocks
  const _blocks: Block[] = await Promise.all(
    _page.blocks.map(async (data) => {
      const _response = await db.find({
        selector: {
          $type: DocumentType.Block,
          _id: data._id,
        },
      })

      const _block = _response.docs[0]

      // check for atomic block closure
      if (data.type?.match(/^END_/)) {
        _block.text = {
          textValue: getAtomicClosureText(data.type, _block.text.textValue),
          ranges: [],
        }
        _block.type = data.type
      }
      return _block
      //  return _response.docs[0]
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

export default populatePage
