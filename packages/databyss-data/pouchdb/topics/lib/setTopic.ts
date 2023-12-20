import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import { Topic } from '@databyss-org/services/interfaces'
import { DocumentType, DocumentCacheDict } from '../../interfaces'
import { getDocument, upsertImmediate } from '../../utils'
import { updateInlines } from '../../../../databyss-editor/lib/inlineUtils/updateInlines'
import { topicsEqual } from '../../compare'
import { selectors } from '../../selectors'
import { queryClient } from '@databyss-org/services/lib/queryClient'

const setTopic = async (data: Topic, caches?: DocumentCacheDict) => {
  const { text, _id } = data
  const doc = {
    ...data,
    type: BlockType.Topic,
  }

  // const _prevTopic: Topic | null = await getDocument(_id)

  // update caches
  ;[selectors.TOPICS, selectors.BLOCKS].forEach((selector) =>
    queryClient.setQueryData([selector], (oldData: any) => ({
      ...(oldData ?? {}),
      [_id]: doc,
    }))
  )
  queryClient.setQueryData([`useDocument_${_id}`], doc)

  await upsertImmediate({
    doctype: DocumentType.Block,
    _id,
    doc,
  })

  // if (_prevTopic && !topicsEqual(_prevTopic, data)) {
  //   await updateInlines({
  //     inlineType: InlineTypes.InlineTopic,
  //     text,
  //     _id,
  //     caches,
  //   })
  // }
}

export default setTopic
