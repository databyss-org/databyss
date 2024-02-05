import { getAuthorsFromSources } from '@databyss-org/services/lib/util'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import {
  BlockType,
  SourceCitationHeader,
  Author,
} from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { findAll } from '../../crudUtils'

const getAuthors = async (): Promise<Author[] | ResourceNotFoundError> => {
  const _sources: SourceCitationHeader[] = await findAll({
    doctype: DocumentType.Block,
    query: {
      type: BlockType.Source,
    },
    useIndex: 'fetch-atomic',
  })

  if (!_sources.length) {
    return []
  }

  for (const _source of _sources) {
    // look up pages topic appears in using block relations
    _source.isInPages = ['dummy-data']

    // const isInPages: string[] = []
    // // returns all pages where source id is found in element id
    // const _response = await findAll({
    //   doctype: DocumentType.Page,
    //   query: {
    //     blocks: {
    //       $elemMatch: {
    //         _id: _source._id,
    //       },
    //     },
    //   },
    //   useIndex: 'page-blocks',
    // })

    // if (_response.length) {
    //   _response.forEach((d) => {
    //     if (!d.archive) {
    //       isInPages.push(d._id)
    //     }
    //   })
    //   _source.isInPages = isInPages
    // }
  }
  // group by authors and return array of authors
  const authorsDict = getAuthorsFromSources(_sources)

  return Object.values(authorsDict)
}

export default getAuthors
