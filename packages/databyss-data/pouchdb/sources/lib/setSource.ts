import { Source, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsert } from '../../utils'

export const setSource = async (data: Source) => {
  const { text, detail, _id } = data
  const blockFields = {
    _id,
    text,
    type: BlockType.Source,
    doctype: DocumentType.Block,
    detail,
  }
  // TODO: get document and use Object.assign(_source, blockFields) to only replace new fields
  await upsert({
    doctype: DocumentType.Block,
    _id,
    doc: blockFields,
  })
}

export default setSource
