import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import { Topic } from '@databyss-org/services/interfaces'
import { DocumentType, DocumentCacheDict } from '../../interfaces'
import { upsertImmediate } from '../../utils'
import { updateInlines } from '../../../../databyss-editor/lib/inlineUtils/updateInlines'

const setTopic = async (data: Topic, caches?: DocumentCacheDict) => {
  console.log('[setTopic] caches', caches)
  const { text, _id } = data

  await upsertImmediate({
    doctype: DocumentType.Block,
    _id,
    doc: {
      ...data,
      type: BlockType.Topic,
    },
  })

  await updateInlines({
    inlineType: InlineTypes.InlineTopic,
    text,
    _id,
    caches,
  })
}

export default setTopic
