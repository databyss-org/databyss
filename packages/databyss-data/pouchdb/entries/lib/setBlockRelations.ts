import {
  BlockRelationPayload,
  BlockRelationResponse,
  BlockRelationOperation,
} from '@databyss-org/editor/interfaces'
// import { DocumentType } from '../../interfaces';
// import { dbRef } from '../../db'
// import { findAll, replaceOne, findOne } from '../../utils';

import { findOne, upsert } from '../../utils'
import { DocumentType } from '../../interfaces'

const setBlockRelations = async (payload: BlockRelationPayload) => {
  const { _id, page, operationType, type } = payload
  // find relation type

  const _relationId = `r_${_id}`

  const _payload: BlockRelationResponse = {
    _id: _relationId,
    type,
    pages: [],
  }

  const res = await findOne({
    $type: DocumentType.BlockRelation,
    query: {
      _id: _relationId,
    },
  })

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
    // remove page array
    if (operationType === BlockRelationOperation.REMOVE) {
      _payload.pages = res.pages.filter((p) => p !== page)
      upsert({
        $type: DocumentType.BlockRelation,
        _id: _relationId,
        doc: _payload,
      })
      return
    }
    // append to page if not already in data
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
