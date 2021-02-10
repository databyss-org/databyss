import {
  BlockRelationPayload,
  BlockRelationResponse,
} from '@databyss-org/editor/interfaces'
// import { DocumentType } from '../../interfaces';
// import { dbRef } from '../../db'
// import { findAll, replaceOne, findOne } from '../../utils';

import { findOne, upsert } from '../../utils'
import { DocumentType } from '../../interfaces'

const setBlockRelations = async (payload: BlockRelationPayload) => {
  console.log('ADDD', payload)
  // find relation type

  const _relationId = `r_${payload._id}`

  const _payload: BlockRelationResponse = {
    _id: _relationId,
    pages: [],
  }

  const res = await findOne({
    $type: DocumentType.BlockRelation,
    query: {
      _id: _relationId,
    },
  })

  console.log('RESPONSE', res)

  // if no relation exists for atomic, create one
  if (!res) {
    _payload.pages = [payload.page]
    console.log(_payload)
    upsert({
      $type: DocumentType.BlockRelation,
      _id: _relationId,
      doc: _payload,
    })
  }

  // for (const payload of payloadArray) {
  //   const { blocksRelationArray, clearPageRelationships } = payload

  //   // clear all block relationships associated to page id
  //   if (clearPageRelationships) {
  //     const _blockRelationsToClear = await findAll({
  //       $type: DocumentType.BlockRelation,
  //       query: {
  //         page: clearPageRelationships,
  //       },
  //       useIndex: 'block-relations-page',
  //     })

  //     const _idsToDelete: any = []
  //     _blockRelationsToClear.forEach((r) => {
  //       if (r?._id && r?._rev) {
  //         _idsToDelete.push({ _id: r._id, _rev: r._rev })
  //       }
  //     })

  //     await dbRef.current.bulkDocs(
  //       _idsToDelete.map((i) => ({ _id: i._id, _rev: i._rev, _deleted: true }))
  //     )
  //   }
  //   if (blocksRelationArray?.length) {
  //     for (const relationship of blocksRelationArray) {
  //       const { block, relatedBlock, removeBlock } = relationship
  //       await replaceOne({
  //         $type: DocumentType.BlockRelation,
  //         query: { block, relatedBlock },
  //         doc: { ...relationship, _deleted: !!removeBlock },
  //       })
  //     }
  //   }
  // }
}

export default setBlockRelations
