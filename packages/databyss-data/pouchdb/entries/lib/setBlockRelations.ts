import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { BlockRelationOperation } from '@databyss-org/editor/interfaces'
import { getDocument, upsert } from '../../utils'
import { DocumentType } from '../../interfaces'

// TODO: add addGroupToDocumentsFromPage here
const setBlockRelations = async (payload: {
  _id: string
  type: BlockType
  page: string
  operationType: BlockRelationOperation
}) => {
  const { _id, page, operationType, type } = payload
  // find relation type

  const _relationId = `r_${_id}`

  const _payload: BlockRelation = {
    _id: _relationId,
    blockId: _id,
    blockType: type,
    pages: [],
  }

  const res = await getDocument<BlockRelation>(_relationId)

  // if no relation exists for atomic, create one
  if (!res) {
    if (operationType === BlockRelationOperation.REMOVE) {
      // bail early if no relation exists
      return
    }
    _payload.pages = [page]
    upsert({
      $type: DocumentType.BlockRelation,
      _id: _relationId,
      doc: _payload,
    })
  } else {
    // remove page from pages array
    if (operationType === BlockRelationOperation.REMOVE) {
      _payload.pages = res.pages.filter((p) => p !== page)
      upsert({
        $type: DocumentType.BlockRelation,
        _id: _relationId,
        doc: _payload,
      })
      return
    }
    // append page to pages if not already in data
    if (res.pages.find((p) => p === page)) {
      return
    }
    const _pages = res.pages
    _pages.push(page)
    _payload.pages = _pages
    upsert({
      $type: DocumentType.BlockRelation,
      _id: _relationId,
      doc: _payload,
    })
  }
}

export default setBlockRelations
