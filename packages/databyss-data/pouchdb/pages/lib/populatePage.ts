import { Page } from '@databyss-org/services/interfaces/Page'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { Block } from '@databyss-org/editor/interfaces'
import { getAtomicClosureText } from '@databyss-org/services/blocks'
import { PageDoc } from '../../interfaces'
import { Selection } from '../../../../databyss-services/interfaces/Selection'
import { getDocument, getDocuments } from '../../utils'

const populatePage = async (
  _id: string
): Promise<Page | ResourceNotFoundError> => {
  try {
    const _page: PageDoc | null = await getDocument(_id)

    if (!_page) {
      return new ResourceNotFoundError('page not found')
    }
    // load selection
    const _selection: Selection | null = await getDocument(_page.selection)

    // coallesce page blocks into dict to filter duplicates and end blocks
    const _blocksToGetDict = _page.blocks.reduce((accum, curr) => {
      if (curr?.type?.match(/^END_/)) {
        return accum
      }
      accum[curr._id] = curr
      return accum
    }, {})

    // get all blocks in one request using bulk getDocuments
    const _blocksDict = await getDocuments<Block>(Object.keys(_blocksToGetDict))

    // populate blocks
    const _blocks = _page.blocks.map((_pageBlock) => {
      const _block = _blocksDict[_pageBlock._id]
      if (_pageBlock.type?.match(/^END_/)) {
        if (!_block) {
          throw new Error(
            `Can't find opener block for closer block with id: ${_pageBlock._id}`
          )
        }
        return {
          ..._pageBlock,
          text: {
            textValue: getAtomicClosureText(
              _pageBlock.type,
              _block.text.textValue
            ),
            ranges: [],
          },
        }
      }
      return _block
    }) as Block[]

    // add to blocks and selection to page
    const _populatedPage: Page = {
      ..._page,
      selection: _selection!,
      blocks: _blocks,
    }

    return _populatedPage
  } catch (err) {
    console.error(err)
    return new ResourceNotFoundError('page not found')
  }
}

export default populatePage
