import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import { replaceInlineText } from '@databyss-org/editor/state/util'
import { Topic, Block, Page } from '@databyss-org/services/interfaces'
import { BlockRelation } from '@databyss-org/editor/interfaces'
import { DocumentType } from '../../interfaces'
import { upsert, getDocument, findOne } from '../../utils'
import { replicateSharedPage } from '../../groups'
import { updateInlines } from '../../../../databyss-editor/lib/inlineUtils/updateInlines'

const setTopic = async (data: Topic) => {
  const { text, _id } = data

  await upsert({
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
  })
}

export default setTopic
