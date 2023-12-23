import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { upsertImmediate } from '@databyss-org/data/pouchdb/utils'
import { Embed, BlockType } from '../interfaces/Block'
import { InlineTypes } from '../interfaces/Range'
import { selectors } from '@databyss-org/data/pouchdb/selectors'
import { queryClient } from '../lib/queryClient'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

export const setEmbed = async (data: Embed) => {
  const { text, detail, _id } = data as any

  const blockFields = {
    _id,
    text,
    detail,
    doctype: DocumentType.Block,
    type: BlockType.Embed,
  }

  const upsertData = {
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  }

  // console.log('[setEmbed]', blockFields)

  // update caches
  ;[selectors.EMBEDS, selectors.BLOCKS].forEach((selector) =>
    queryClient.setQueryData([selector], (oldData: any) => ({
      ...(oldData ?? {}),
      [_id]: blockFields,
    }))
  )
  queryClient.setQueryData([`useDocument_${_id}`], blockFields)

  await upsertImmediate(upsertData)

  eapi.db.updateInlines({
    inlineType: InlineTypes.Embed,
    text,
    _id,
  })
}
