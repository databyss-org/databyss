import { Source, BlockType } from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { DocumentType } from '../../interfaces'
import { findAll } from '../../crudUtils'

const getSources = async (): Promise<Source[] | ResourceNotFoundError> => {
  const _sources = await findAll({
    doctype: DocumentType.Block,
    query: {
      type: BlockType.Source,
    },
    useIndex: 'fetch-atomic',
  })

  return _sources
}

export default getSources
