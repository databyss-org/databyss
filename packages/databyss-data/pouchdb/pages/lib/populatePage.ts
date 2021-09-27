import PCancelable from 'p-cancelable'
import { Page } from '@databyss-org/services/interfaces/Page'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { Block } from '@databyss-org/editor/interfaces'
import { getAtomicClosureText } from '@databyss-org/services/blocks'
import { PageDoc } from '../../interfaces'
import { Selection } from '../../../../databyss-services/interfaces/Selection'
import { getDocument, getDocuments } from '../../utils'

const RETRY_DELAY = 1500
const MAX_RETRIES = 5

export default (_id: string) =>
  new PCancelable<Page | ResourceNotFoundError>((resolve, reject, onCancel) => {
    let _timer: number

    onCancel(() => {
      clearTimeout(_timer)
    })

    const _populatePage = async (_id: string, count: number = 0) => {
      try {
        const _retry = () => {
          console.log(`[populatePage] retry ${count + 1}`)
          _timer = window.setTimeout(
            () => _populatePage(_id, count + 1),
            RETRY_DELAY
          )
        }

        if (count > MAX_RETRIES) {
          console.log(
            '[populatePage] exceeded max retries, settling with "page not found"'
          )
          return resolve(new ResourceNotFoundError(`page ${_id} not found`))
        }

        const _page: PageDoc | null = await getDocument(_id, true)

        if (!_page) {
          console.log('[populatePage] page missing, retry')
          return _retry()
        }
        // load selection
        const _selection: Selection =
          (await getDocument(_page.selection)) ?? new Selection()

        // coallesce page blocks into dict to filter duplicates and end blocks
        const _blocksToGetDict = _page.blocks.reduce((accum, curr) => {
          if (curr?.type?.match(/^END_/)) {
            return accum
          }
          accum[curr._id] = curr
          return accum
        }, {})

        // get all blocks in one request using bulk getDocuments
        let _blocksDict
        try {
          _blocksDict = await getDocuments<Block>(
            Object.keys(_blocksToGetDict),
            true
          )
        } catch (err) {
          console.log(`[populatePage] getDocuments error: `, err)
          if (err instanceof ResourceNotFoundError) {
            console.log('[populatePage] one or more blocks missing, retry')
            return _retry()
          }
        }

        // populate blocks
        const _blocks = _page.blocks
          .map((_pageBlock) => {
            const _block = _blocksDict[_pageBlock._id]
            if (_pageBlock.type?.match(/^END_/)) {
              if (!_block) {
                console.warn(
                  `[populatePage] Can't find opener block for closer block with id: ${_pageBlock._id}`
                )
                return null
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
          })
          .filter((_b) => !!_b) as Block[]

        // add to blocks and selection to page
        const _populatedPage: Page = {
          ..._page,
          selection: _selection,
          blocks: _blocks!,
        }

        resolve(_populatedPage)
      } catch (err) {
        reject(err)
      }
      return null
    }

    _populatePage(_id)
  })
