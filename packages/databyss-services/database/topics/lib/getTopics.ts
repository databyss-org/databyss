import {
  BlockRelation,
  DocumentType,
  BlockType,
} from '@databyss-org/editor/interfaces'
import { db } from '../../db'
import { Topic, Page } from '../../../interfaces'
import { ResourceNotFoundError } from '../../../interfaces/Errors'

const getTopicHeaders = async () => {
  const _response = await db.find({
    selector: {
      $type: DocumentType.Block,
      type: BlockType.Topic,
    },
  })
  if (!_response.docs.length) {
    return new ResourceNotFoundError('no topics found')
  }

  const _topics: Topic[] = _response.docs
  for (const _topic of _topics) {
    // look up pages topic appears in using block relations
    const isInPages: string[] = []

    const _blockRelationsResponse = await db.find({
      selector: {
        $type: DocumentType.BlockRelation,
        relatedBlock: _topic._id,
      },
    })
    const _blockRelations: BlockRelation[] = _blockRelationsResponse.docs

    if (_blockRelations.length) {
      // find if page has been archived
      for (const _relation of _blockRelations) {
        if (_relation.page) {
          const _page: Page = await db.get(_relation.page)
          if (_page && !_page?.archive) {
            // if page has not been archived, push to array
            isInPages.push(_page._id)
          }
        }
      }
    }

    // look up to see if it exists on a page not yet added as a block relation
    // returns all pages where source id is found in element id
    const __response = await db.find({
      selector: {
        $type: DocumentType.Page,
        blocks: {
          $elemMatch: {
            _id: _topic._id,
          },
        },
      },
    })
    if (__response.docs.length) {
      __response.docs.forEach((d) => {
        if (!d.archive && !isInPages.includes(d._id)) {
          isInPages.push(d._id)
        }
      })
      // _source.isInPages = isInPages
    }
    _topic.isInPages = isInPages
  }
  return _topics
}

export default getTopicHeaders
