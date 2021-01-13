import { BlockRelation } from '@databyss-org/editor/interfaces'
import { Page } from '@databyss-org/services/interfaces/Page'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { Topic, BlockType } from '@databyss-org/services/interfaces/Block'
import { DocumentType } from '../../interfaces'
import { findOne, findAll } from '../../utils'

const getTopic = async (
  _id: string
): Promise<Topic | ResourceNotFoundError> => {
  const _topic = await findOne(DocumentType.Block, {
    _id,
    type: BlockType.Topic,
  })

  if (!_topic) {
    return new ResourceNotFoundError('no topics founds')
  }

  const isInPages: string[] = []
  // returns all pages where source id is found in element id
  const _pages = await findAll(DocumentType.Page, {
    blocks: {
      $elemMatch: {
        _id,
      },
    },
  })

  // append pages topic appears in as property `inPages`
  if (_pages.length) {
    _pages.forEach((d) => {
      if (!d.archive) {
        isInPages.push(d._id)
      }
    })
  }
  _topic.isInPages = isInPages

  // find inline elements and tag to `isInPages` ignoring duplicates
  const _blockRelations: BlockRelation[] = await findAll(
    DocumentType.BlockRelation,
    {
      relatedBlock: _topic._id,
    }
  )

  if (_blockRelations.length) {
    // find if page has been archived
    for (const _relation of _blockRelations) {
      if (_relation.page) {
        const _page: Page = await findOne(DocumentType.Page, {
          _id: _relation.page,
        })

        if (_page && !_page?.archive) {
          // if page has not been archived and is currently not in array, push to array
          if (!isInPages.includes(_page._id)) {
            isInPages.push(_page._id)
          }
        }
      }
    }
    _topic.isInPages = isInPages
  }

  return _topic
}

export default getTopic
