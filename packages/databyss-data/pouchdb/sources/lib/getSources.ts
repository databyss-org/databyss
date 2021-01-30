import { Source, BlockType } from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { DocumentType } from '../../interfaces'
import { findAll } from '../../utils'

const getSources = async (): Promise<Source[] | ResourceNotFoundError> => {
  const _sources = await findAll(DocumentType.Block, {
    type: BlockType.Source,
  })

  return _sources
}

export default getSources
