import { BlockRelation } from '@databyss-org/editor/interfaces'
import { Page } from '@databyss-org/services/interfaces/Page'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { Topic, BlockType } from '@databyss-org/services/interfaces/Block'
import { DocumentType } from '../../interfaces'
import { findOne, findAll } from '../../utils'

const getTopic = async (
  _id: string
): Promise<Topic | ResourceNotFoundError> => {
  const _topic = await findOne({
    $type: DocumentType.Block,
    query: {
      type: BlockType.Topic,
      _id,
    },
    useIndex: 'fetch-atomic-id',
  })

  if (!_topic) {
    return new ResourceNotFoundError('no topics founds')
  }

  // const isInPages: string[] = []
  // // returns all pages where source id is found in element id
  // const _pages = await findAll({
  //   $type: DocumentType.Page,
  //   query: {
  //     blocks: {
  //       $elemMatch: {
  //         _id,
  //       },
  //     },
  //   },
  //   useIndex: 'page-blocks',
  // })

  // // append pages topic appears in as property `inPages`
  // if (_pages.length) {
  //   _pages.forEach((d) => {
  //     if (!d.archive) {
  //       isInPages.push(d._id)
  //     }
  //   })
  // }
  // _topic.isInPages = isInPages

  // // find inline elements and tag to `isInPages` ignoring duplicates
  // const _blockRelations: BlockRelation[] = await findAll({
  //   $type: DocumentType.BlockRelation,
  //   query: {
  //     relatedBlock: _topic._id,
  //   },
  // })

  // if (_blockRelations.length) {
  //   // find if page has been archived
  //   for (const _relation of _blockRelations) {
  //     if (_relation.page) {
  //       const _page: Page = await findOne({
  //         $type: DocumentType.Page,
  //         query: {
  //           _id: _relation.page,
  //         },
  //         useIndex: 'fetch-one',
  //       })

  //       if (_page && !_page?.archive) {
  //         // if page has not been archived and is currently not in array, push to array
  //         if (!isInPages.includes(_page._id)) {
  //           isInPages.push(_page._id)
  //         }
  //       }
  //     }
  //   }
  //   _topic.isInPages = isInPages
  // }
  _topic.isInPages = ['dummy-data']

  return _topic
}

export default getTopic
