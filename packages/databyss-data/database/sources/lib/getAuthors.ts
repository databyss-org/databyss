import { getAuthorsFromSources } from '@databyss-org/services/lib/util'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import {
  BlockType,
  SourceCitationHeader,
  Author,
} from '@databyss-org/services/interfaces'
import { db } from '../../db'
import { DocumentType } from '../../interfaces'

const getAuthors = async (): Promise<Author[] | ResourceNotFoundError> => {
  const _response = await db.find({
    selector: {
      $type: DocumentType.Block,
      type: BlockType.Source,
    },
  })

  if (!_response.docs.length) {
    return []
    // return new ResourceNotFoundError('no authors found')
  }

  const _sources: SourceCitationHeader[] = _response.docs

  for (const _source of _sources) {
    // look up pages topic appears in using block relations

    const isInPages: string[] = []
    // returns all pages where source id is found in element id
    const __response = await db.find({
      selector: {
        $type: DocumentType.Page,
        blocks: {
          $elemMatch: {
            _id: _source._id,
          },
        },
      },
    })
    if (__response.docs.length) {
      __response.docs.forEach((d) => {
        if (!d.archive) {
          isInPages.push(d._id)
        }
      })
      _source.isInPages = isInPages
    }
  }
  // group by authors and return array of authors
  const authorsDict = getAuthorsFromSources(_sources)

  return Object.values(authorsDict)
}

export default getAuthors
