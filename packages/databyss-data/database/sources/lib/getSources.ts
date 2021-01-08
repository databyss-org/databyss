import {
  Source,
  BlockType,
  DocumentType,
} from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { db } from '../../db'

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

export default getSources
