import {
  Source,
  BlockType,
  SourceCitationHeader,
} from '@databyss-org/services/interfaces'
import { DocumentType, DocumentCacheDict } from '../../interfaces'
import { getDocument, upsertImmediate } from '../../utils'
import { InlineTypes } from '../../../../databyss-services/interfaces/Range'
import { updateInlines } from '../../../../databyss-editor/lib/inlineUtils/updateInlines'
import { sourcesEqual } from '../../compare'

export const setSource = async (data: Source, caches?: DocumentCacheDict) => {
  const { text, detail, _id, sharedWithGroups } = data as any

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
  }

  // const _prevSource: SourceCitationHeader | null = await getDocument(_id)

  await upsertImmediate({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })

  // if (_prevSource && !sourcesEqual(_prevSource, blockFields)) {
  //   await updateInlines({
  //     inlineType: InlineTypes.InlineSource,
  //     text: name,
  //     _id,
  //     caches,
  //   })
  // }
}

export default setSource
