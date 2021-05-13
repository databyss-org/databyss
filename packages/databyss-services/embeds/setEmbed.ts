import { Embed, BlockType } from '../interfaces/Block'
import { DocumentType } from '../../databyss-data/pouchdb/interfaces'
import { upsert } from '../../databyss-data/pouchdb/utils'

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

  await upsert({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })
  // TODO: UPDATE INLINES
}
