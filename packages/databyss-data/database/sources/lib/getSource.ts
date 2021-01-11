import {
  SourceCitationHeader,
  BlockType,
} from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { db } from '../../db'
import { DocumentType } from '../../interfaces'

const getSource = async (
  _id: string
): Promise<SourceCitationHeader | ResourceNotFoundError> => {
  // get source and pages source exists in
  const _response = await db.find({
    selector: { _id, $type: DocumentType.Block, type: BlockType.Source },
  })
  if (!_response.docs.length) {
    return new ResourceNotFoundError('source not found')
  }

  const _source: SourceCitationHeader = _response.docs[0]

  if (!_source || _source.type !== BlockType.Source) {
    return new ResourceNotFoundError()
  }

  const isInPages: string[] = []
  // returns all pages where source id is found in element id
  const _pageResponse = await db.find({
    selector: {
      $type: DocumentType.Page,
      blocks: {
        $elemMatch: {
          _id,
        },
      },
    },
  })
  if (_pageResponse.docs.length) {
    _pageResponse.docs.forEach((d) => {
      if (!d.archive) {
        isInPages.push(d._id)
      }
    })
  }
  _source.isInPages = isInPages

  return _source
}

export default getSource
