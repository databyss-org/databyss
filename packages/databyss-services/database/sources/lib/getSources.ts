import { db } from '../../db'
import { Source, BlockType, DocumentType } from '../../../interfaces'
import { ResourceNotFoundError } from '../../../interfaces/Errors'
import { asyncErrorHandler } from '../../util'

const getSources = async (): Promise<Source[] | ResourceNotFoundError> => {
  const _response = await db.find({
    selector: {
      type: BlockType.Source,
      $type: DocumentType.Block,
    },
  })

  if (!_response.docs.length) {
    return new ResourceNotFoundError('no sources found')
  }

  return _response.docs
}

export default asyncErrorHandler(getSources)
