import { Page } from '@databyss-org/services/interfaces/Page'
import { Block } from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { getAtomicClosureText } from '@databyss-org/services/blocks'
import { PageDoc, DocumentType } from '../../interfaces'
import { findOne, getDocument } from '../../utils'
import { Selection } from '../../../../databyss-services/interfaces/Selection'

const populatePage = async (
  _id: string
): Promise<Page | ResourceNotFoundError> => {
  // TODO: wrap function in error handler
  const _page: PageDoc | null = await findOne({
    doctype: DocumentType.Page,
    query: {
      _id,
    },
    useIndex: 'fetch-one',
  })

  if (!_page) {
    return new ResourceNotFoundError('page not found')
  }
  // load selection
  const _selection: Selection | null = await getDocument(_page.selection)

  // map block ids to load to an array
  const _blockIds = _page.blocks
    .map((_block) => !_block.type?.match(/^END_/) && _block._id)
    .filter((_block) => !!_block)
  console.log('populatePage.blockIds', _blockIds)

  // load blocks
  const _blocks: Block[] = await Promise.all(
    _page.blocks.map(async (data) => {
      const _block: Block | null = await findOne({
        doctype: DocumentType.Block,
        query: {
          _id: data._id,
        },
        useIndex: 'fetch-one',
      })
      // check for atomic block closure
      if (_block && data.type?.match(/^END_/)) {
        _block.text = {
          textValue: getAtomicClosureText(data.type, _block.text.textValue),
          ranges: [],
        }
        _block.type = data.type
      }
      return _block!
    })
  )

  // TODO: load blocks in bulk

  // add to blocks and selection to page
  const _populatedPage: Page = {
    ..._page,
    selection: _selection!,
    blocks: _blocks!,
  }

  return _populatedPage
}

export default populatePage
