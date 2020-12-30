import { db } from '../../db'
// import { DocumentType } from '../interfaces'
// import { ResourceNotFoundError } from '../../interfaces/Errors'
import { SourceCitationHeader, DocumentType } from '../../../interfaces'
import { BlockType } from '../../../interfaces/Block'
import { ResourceNotFoundError } from '../../../interfaces/Errors'

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
