import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import { Topic } from '@databyss-org/services/interfaces'
import { queryClient } from '@databyss-org/services/lib/queryClient'
import { DocumentType } from '../../interfaces'
import { upsertImmediate } from '../../utils'
import { selectors } from '../../selectors'
import { addTimeStamp } from '../../docUtils'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../../databyss-desktop/src/eapi').default

const setTopic = async (data: Topic) => {
  const { text, _id } = data
  const doc = addTimeStamp({
    ...data,
    type: BlockType.Topic,
  })

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

  eapi.db.updateInlines({
    inlineType: InlineTypes.InlineTopic,
    text,
    _id,
  })
}

export default setTopic
