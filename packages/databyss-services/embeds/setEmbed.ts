import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { upsert } from '@databyss-org/data/pouchdb/utils'
import { updateInlines } from '@databyss-org/editor/lib/inlineUtils/updateInlines'
import { InlineTypes } from '../interfaces/Range'
import { Embed, BlockType } from '../interfaces/Block'

export const setEmbed = async (data: Embed) => {
  const { text, detail, _id, sharedWithGroups } = data as any

  const blockFields = {
    _id,
    text,
    detail,
    sharedWithGroups,
    doctype: DocumentType.Block,
    type: BlockType.Embed,
    modifiedAt: Date.now(),
  }

  await upsert({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })

  await updateInlines({
    inlineType: InlineTypes.Embed,
    text,
    _id,
  })
}
