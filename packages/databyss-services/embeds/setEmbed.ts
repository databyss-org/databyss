import equal from 'fast-deep-equal'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  getDocument,
  upsert,
  upsertImmediate,
} from '@databyss-org/data/pouchdb/utils'
import { updateInlines } from '@databyss-org/editor/lib/inlineUtils/updateInlines'
import { InlineTypes } from '../interfaces/Range'
import { Embed, BlockType } from '../interfaces/Block'

export const setEmbed = async (data: Embed, immediate?: boolean) => {
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

  const _prevEmbed: Embed | null = await getDocument(_id)

  if (immediate) {
    await upsertImmediate(upsertData)
  } else {
    await upsert(upsertData)
  }

  if (
    _prevEmbed &&
    (_prevEmbed.text?.textValue !== text?.textValue ||
      !equal(_prevEmbed.detail, detail))
  )
    await updateInlines({
      inlineType: InlineTypes.Embed,
      text,
      _id,
    })
}
