import { Embed, BlockType } from '../interfaces/Block'
import { DocumentType } from '../../databyss-data/pouchdb/interfaces'
import { upsert } from '../../databyss-data/pouchdb/utils'
import { updateInlines } from '../../databyss-editor/lib/inlineUtils/updateInlines'
import { InlineTypes } from '../interfaces/Range'

export const setEmbed = async (data: Embed) => {
  const { text, detail, _id, sharedWithGroups } = data as any

  const blockFields = {
    _id,
    text,
    detail,
    sharedWithGroups,
    doctype: DocumentType.Block,
    type: BlockType.Embed,
  }

  console.log('block fields', blockFields)
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
