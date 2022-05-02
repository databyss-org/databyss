import { Source, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsertImmediate } from '../../utils'

export const setSource = async (data: Source) => {
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

  await upsertImmediate({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })

  return name
}

export default setSource
