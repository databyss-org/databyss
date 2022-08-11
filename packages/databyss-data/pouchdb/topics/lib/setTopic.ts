import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import { Topic } from '@databyss-org/services/interfaces'
import { DocumentType, DocumentCacheDict } from '../../interfaces'
import { getDocument, upsertImmediate } from '../../utils'
import { updateInlines } from '../../../../databyss-editor/lib/inlineUtils/updateInlines'

const setTopic = async (data: Topic, caches?: DocumentCacheDict) => {
  const { text, _id } = data

  const _prevTopic: Topic | null = await getDocument(_id)

  await upsertImmediate({
    doctype: DocumentType.Block,
    _id,
    doc: {
      ...data,
      type: BlockType.Topic,
    },
  })

  if (_prevTopic && _prevTopic.text.textValue !== text.textValue) {
    await updateInlines({
      inlineType: InlineTypes.InlineTopic,
      text,
      _id,
      caches,
    })
  }
}

export default setTopic
