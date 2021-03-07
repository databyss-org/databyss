import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { Topic } from '@databyss-org/services/interfaces/Block'
import { getDocument } from '../../utils'

const getTopic = async (
  _id: string
): Promise<Topic | ResourceNotFoundError> => {
  const _topic: Topic | null = await getDocument(_id)

  if (!_topic) {
    return new ResourceNotFoundError('no topics founds')
  }

  return _topic
}

export default getTopic
