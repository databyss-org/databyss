import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { dbRef } from '../db'
import { DocumentType } from '../interfaces'

export const useBlockRelations = (blockType: BlockType) => {
  const queryKey = `blockRelations_${blockType}`
  const queryClient = useQueryClient()
  const query = useQuery<BlockRelation[]>(
    queryKey,
    () =>
      new Promise<BlockRelation[]>((resolve, reject) =>
        dbRef.current
          .find({
            selector: {
              $type: DocumentType.BlockRelation,
              relatedBlockType: blockType,
            },
          })
          .then((res) => resolve(res.docs))
          .catch((err) => reject(err))
      )
  )

  useEffect(() => {
    console.log('useBlockRelations.subscribe')
    const changes = dbRef.current
      .changes({
        since: 'now',
        live: true,
      })
      .on('change', (change) => {
        console.log('useBlockRelations.change', change)
        if (
          change.deleted ||
          !queryClient
            .getQueryData<BlockRelation[]>(queryKey)
            ?.find((d) => d._id === change.id)
        ) {
          // doc was added or removed, refresh list
          queryClient.invalidateQueries(queryKey)
        }
        // else the doc was modified, so the cache at the last value
        // it is up to another query hook to update single block relations
      })
    return () => {
      console.log('useBlockRelations.unsubscribe')
      changes.cancel()
    }
  }, [])

  return query
}
