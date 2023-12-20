import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { upsertImmediate } from '@databyss-org/data/pouchdb/utils'
import { Embed, BlockType } from '../interfaces/Block'
import { InlineTypes } from '../interfaces/Range'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

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

  const upsertData = {
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  }

  console.log('[setEmbed]', _id, sharedWithGroups)

  await upsertImmediate(upsertData)

  eapi.db.updateInlines({
    inlineType: InlineTypes.Embed,
    text,
    _id,
  })
}
