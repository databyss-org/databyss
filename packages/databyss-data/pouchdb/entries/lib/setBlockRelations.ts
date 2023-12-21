import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { BlockRelationOperation } from '@databyss-org/editor/interfaces'
import { QueryClient } from '@tanstack/query-core'
import { blockTypeToRelationSelector } from '../../selectors'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../../databyss-desktop/src/eapi').default

const setBlockRelations = async (
  payload: {
    _id: string
    type: BlockType
    page: string
    operationType: BlockRelationOperation
  },
  queryClient: QueryClient
) => {
  const { _id, page, operationType, type } = payload

  const _payload = {
    blockId: _id,
    blockType: type,
    pageId: page,
  }

  let _updatedRelation: BlockRelation
  if (operationType === BlockRelationOperation.ADD) {
    _updatedRelation = await eapi.db.addRelation(_payload)
  } else {
    _updatedRelation = await eapi.db.removeRelation(_payload)
  }

  console.log('[setBlockRelations]', _updatedRelation)
  queryClient.setQueryData(
    [blockTypeToRelationSelector(type)],
    (oldData: any) => ({
      ...(oldData ?? {}),
      [_updatedRelation._id]: _updatedRelation,
    })
  )
  queryClient.setQueryData(
    [`useDocument_${_updatedRelation._id}`],
    _updatedRelation
  )
}

export default setBlockRelations
