import { Page } from '@databyss-org/services/interfaces/Page'
import { Block } from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { PageDoc, DocumentType } from '../../interfaces'
import { getAtomicClosureText } from '../util'
import { findOne } from '../../utils'

const populatePage = async (
  _id: string
): Promise<Page | ResourceNotFoundError> => {
  // TODO: wrap function in error handler

  const _page: PageDoc | null = await findOne({
    $type: DocumentType.Page,
    query: {
      _id,
    },
    useIndex: 'fetch-one',
  })

  if (!_page) {
    return new ResourceNotFoundError('page not found')
  }
  // load selection
  const _selection = await findOne({
    $type: DocumentType.Selection,
    query: {
      _id: _page.selection,
    },
    useIndex: 'fetch-one',
  })

  // load blocks
  const _blocks: Block[] = await Promise.all(
    _page.blocks.map(async (data) => {
      const _block = await findOne({
        $type: DocumentType.Block,
        query: {
          _id: data._id,
        },
        useIndex: 'fetch-one',
      })

      // check for atomic block closure
      if (data.type?.match(/^END_/)) {
        _block.text = {
          textValue: getAtomicClosureText(data.type, _block.text.textValue),
          ranges: [],
        }
        _block.type = data.type
      }
      return _block
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
