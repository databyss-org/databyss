import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { Topic, BlockType } from '@databyss-org/services/interfaces/Block'
import { DocumentType } from '../../interfaces'
import { findOne } from '../../utils'

const getTopic = async (
  _id: string
): Promise<Topic | ResourceNotFoundError> => {
  const _topic: Topic | null = await findOne({
    $type: DocumentType.Block,
    query: {
      type: BlockType.Topic,
      _id,
    },
    useIndex: 'fetch-atomic-id',
  })

  if (!_topic) {
    return new ResourceNotFoundError('no topics founds')
  }

  return _topic
}

export default getTopic
