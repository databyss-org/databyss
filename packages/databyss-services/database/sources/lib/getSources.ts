import { db } from '../../db'
import { Source, BlockType, DocumentType } from '../../../interfaces'

const getSources = async (): Promise<Source[]> => {
  let _source: Source[] = []
  const _response = await db.find({
    selector: {
      type: BlockType.Source,
      $type: DocumentType.Block,
    },
  })
  if (_response.docs.length) {
    _source = _response.docs
  }
  return _source
}

export default getSources
