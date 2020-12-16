import { Author } from '../../interfaces'
import { db } from '../db'
import { getAuthorsFromSources } from '@databyss-org/services/lib/util'
import { DocumentType } from '../interfaces'
import { BlockType } from '@databyss-org/services/interfaces'
import { Source } from '../../interfaces/Block'

const getAuthors = async (): Promise<Author[]> => {
  const _response = await db.find({
    selector: {
      documentType: DocumentType.Block,
      type: BlockType.Source,
    },
  })

  if (!_response.docs.length) {
    return []
  }

  const _sources: Source[] = _response.docs

  for (const _source of _sources) {
    // look up pages topic appears in using block relations

    const isInPages: string[] = []
    // returns all pages where source id is found in element id
    const __response = await db.find({
      selector: {
        documentType: DocumentType.Page,
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
