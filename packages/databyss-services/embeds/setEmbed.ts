import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { upsert } from '@databyss-org/data/pouchdb/utils'
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
  }

  await upsert({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })
}
