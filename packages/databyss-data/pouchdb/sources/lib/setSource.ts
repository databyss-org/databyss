import { Source, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsert, findOne } from '../../utils'
import { BlockRelation } from '../../../../databyss-services/interfaces/Block'
import { replicateSharedPage } from '../../groups/index'

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

  // get block relations to upsert all related documents
  const _relation = await findOne<BlockRelation>({
    doctype: DocumentType.BlockRelation,
    query: {
      blockId: _id,
    },
  })

  if (!_relation) {
    // block has no relations, remove
    return
  }

  // update all replicated pages related to topic
  const pagesWhereAtomicExists: string[] = _relation.pages
  replicateSharedPage(pagesWhereAtomicExists)
}

export default setSource
