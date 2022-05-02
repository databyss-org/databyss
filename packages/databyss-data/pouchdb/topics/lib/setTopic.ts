import { BlockType } from '@databyss-org/services/interfaces/Block'
import { Topic } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsertImmediate } from '../../utils'

const setTopic = async (data: Topic) => {
  const { _id } = data

  await upsertImmediate({
    doctype: DocumentType.Block,
    _id,
    doc: {
      ...data,
      type: BlockType.Topic,
    },
  })
}

export default setTopic
