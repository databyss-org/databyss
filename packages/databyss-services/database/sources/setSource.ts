import { Source, BlockType, DocumentType } from '../../interfaces'
import { db } from '../db'

export const setSource = async (data: Source) => {
  const { text, detail, _id } = data
  const blockFields = {
    _id,
    text,
    type: BlockType.Source,
    documentType: DocumentType.Block,
    detail,
  }

  await db.upsert(_id, (oldDoc) => {
    const _source = oldDoc
    Object.assign(_source, blockFields)
    return _source
  })
}

export default setSource
