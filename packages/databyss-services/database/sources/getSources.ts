import { db } from '../db'
import { BlockType, DocumentType } from '../interfaces'
import { Source } from '../../interfaces/Block'

const getSources = async (): Promise<Source[]> => {
  let _source: Source[] = []
  const _response = await db.find({
    selector: {
      type: BlockType.Source,
      documentType: DocumentType.Block,
    },
  })
  if (_response.docs.length) {
    _source = _response.docs
  }
  return _source
}

export default getSources
