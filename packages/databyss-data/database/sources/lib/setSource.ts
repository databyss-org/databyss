import {
  Source,
  BlockType,
  DocumentType,
} from '@databyss-org/services/interfaces'
import { db, addTimeStamp } from '../../db'

export const setSource = async (data: Source) => {
  const { text, detail, _id } = data
  const blockFields = {
    _id,
    text,
    type: BlockType.Source,
    $type: DocumentType.Block,
    detail,
  }

  await db.upsert(_id, (oldDoc) => {
    const _source = oldDoc
    Object.assign(_source, blockFields)
    return addTimeStamp(_source)
  })
}

export default setSource
