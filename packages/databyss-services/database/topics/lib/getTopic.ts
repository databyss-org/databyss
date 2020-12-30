import { BlockRelation, DocumentType } from '@databyss-org/editor/interfaces'
import { Topic, BlockType } from '../../../interfaces/Block'
import { db } from '../../db'
import { Page } from '../../../interfaces/Page'
import { ResourceNotFoundError } from '../../../interfaces/Errors'
import { asyncErrorHandler } from '../../util'

const getTopic = async (
  _id: string
): Promise<Topic | ResourceNotFoundError> => {
  const _topicResponse = await db.find({
    selector: { _id, $type: DocumentType.Block, type: BlockType.Topic },
  })
  if (!_topicResponse.docs.length) {
    return new ResourceNotFoundError('no topics founds')
  }

  const _topic = _topicResponse.docs[0]

  // const _topic: Topic = await db.get(_id)
  const isInPages: string[] = []
  // returns all pages where source id is found in element id
  const _response = await db.find({
    selector: {
      $type: DocumentType.Page,
      blocks: {
        $elemMatch: {
          _id,
        },
      },
    },
  })

  // append pages topic appears in as property `inPages`
  if (_response.docs.length) {
    _response.docs.forEach((d) => {
      if (!d.archive) {
        isInPages.push(d._id)
      }
    })
  }
  _topic.isInPages = isInPages

  // find inline elements and tag to `isInPages` ignoring duplicates

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

export default asyncErrorHandler(getTopic)
