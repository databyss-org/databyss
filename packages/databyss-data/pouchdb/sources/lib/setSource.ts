import { Source, BlockType } from '@databyss-org/services/interfaces'
import { queryClient } from '@databyss-org/services/lib/queryClient'
import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { DocumentType } from '../../interfaces'
import { upsertImmediate } from '../../utils'
import { selectors } from '../../selectors'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../../databyss-desktop/src/eapi').default

export const setSource = async (data: Source) => {
  const { text, detail, _id, sharedWithGroups, media } = data

  let { name } = data as any
  if (!name?.textValue?.length) {
    name = text
  }
  const blockFields = {
    _id,
    text,
    name,
    type: BlockType.Source,
    doctype: DocumentType.Block,
    detail,
    sharedWithGroups,
    media,
  }

  // update caches
  ;[selectors.SOURCES, selectors.BLOCKS].forEach((selector) =>
    queryClient.setQueryData([selector], (oldData: any) => ({
      ...(oldData ?? {}),
      [_id]: blockFields,
    }))
  )
  queryClient.setQueryData([`useDocument_${_id}`], blockFields)

  await upsertImmediate({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })

  eapi.db.updateInlines({
    inlineType: InlineTypes.InlineSource,
    text: name,
    _id,
  })
}

export default setSource
