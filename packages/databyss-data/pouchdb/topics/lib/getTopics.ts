import { BlockType } from '@databyss-org/editor/interfaces'
import { Topic } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { findAll } from '../../crudUtils'

const getTopicHeaders = async () => {
  const _topics: Topic[] = await findAll({
    doctype: DocumentType.Block,
    query: {
      type: BlockType.Topic,
    },
    useIndex: 'fetch-atomic',
  })

  if (!_topics.length) {
    return []
  }

  for (const _topic of _topics) {
    // look up pages topic appears in using block relations

    // const isInPages: string[] = []
    _topic.isInPages = ['dummy-data']

    // const _blockRelations: BlockRelation[] = await findAll({
    //   doctype: DocumentType.BlockRelation,
    //   query: {
    //     relatedBlock: _topic._id,
    //   },
    //   useIndex: 'block-relations',
    // })

    // if (_blockRelations.length) {
    //   // find if page has been archived
    //   for (const _relation of _blockRelations) {
    //     if (_relation.page) {
    //       const _page: Page = await findOne({
    //         doctype: DocumentType.Page,
    //         query: {
    //           _id: _relation.page,
    //         },
    //         useIndex: 'fetch-one',
    //       })

    //       if (_page && !_page?.archive) {
    //         // if page has not been archived, push to array
    //         isInPages.push(_page._id)
    //       }
    //     }
    //   }
    // }

    // // look up to see if it exists on a page not yet added as a block relation
    // // returns all pages where source id is found in element id
    // const _pages: PageDoc[] = await findAll({
    //   doctype: DocumentType.Page,
    //   query: {
    //     blocks: {
    //       $elemMatch: {
    //         _id: _topic._id,
    //       },
    //     },
    //   },
    //   useIndex: 'page-blocks',
    // })

    // if (_pages.length) {
    //   _pages.forEach((d) => {
    //     if (!d.archive && !isInPages.includes(d._id)) {
    //       isInPages.push(d._id)
    //     }
    //   })
    // }
    // _topic.isInPages = isInPages
  }
  return _topics
}

export default getTopicHeaders
