import { Source, BlockType } from '../interfaces/Block'
import { DocumentType } from './interfaces'
import { db } from './db'

export const setPouchSource = async (data: Source) => {
  const { text, detail, _id } = data
  const blockFields = {
    _id,
    text,
    type: BlockType.Source,
    documentType: DocumentType.Block,
    detail,
  }

  console.log(blockFields)
  await db.upsert(_id, (oldDoc) => {
    const _source = oldDoc
    Object.assign(_source, blockFields)
    return _source
  })
}

export default setPouchSource
