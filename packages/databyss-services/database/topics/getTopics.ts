import {
  BlockRelation,
  DocumentType,
  BlockType,
} from '@databyss-org/editor/interfaces'
import { db } from '../db'
import { Topic, Page } from '../../interfaces'

const getTopicHeaders = async () => {
  const _response = await db.find({
    selector: {
      documentType: DocumentType.Block,
      type: BlockType.Topic,
    },
  })
  if (_response.docs.length) {
    const _topics: Topic[] = _response.docs
    for (const _topic of _topics) {
      // look up pages topic appears in using block relations
      const isInPages: string[] = []

      const _blockRelationsResponse = await db.find({
        selector: {
          documentType: DocumentType.BlockRelation,
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
        _topic.isInPages = isInPages
      }
    }
    return _topics
  }
  return []
}

export default getTopicHeaders
