import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { upsert, upsertImmediate } from '@databyss-org/data/pouchdb/utils'
import { updateInlines } from '@databyss-org/editor/lib/inlineUtils/updateInlines'
import { InlineTypes } from '../interfaces/Range'
import { Embed, BlockType } from '../interfaces/Block'

export const setEmbed = async (data: Embed, immediate?: boolean) => {
  const { text, detail, _id, sharedWithGroups } = data

  const blockFields = {
    _id,
    text,
    detail,
    sharedWithGroups,
    doctype: DocumentType.Block,
    type: BlockType.Embed,
  }

  const upsertData = {
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  }

  if (immediate) {
    await upsertImmediate(upsertData)
  } else {
    await upsert(upsertData)
  }

  await updateInlines({
    inlineType: InlineTypes.Embed,
    text,
    _id,
  })
}
