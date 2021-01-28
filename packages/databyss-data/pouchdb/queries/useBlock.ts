import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { Block } from '@databyss-org/services/interfaces'
import { dbRef } from '../db'

export const useBlock = <blockType extends Block>(id: string) => {
  const queryKey = `block_${id}`
  const queryClient = useQueryClient()
  const query = useQuery<blockType>(queryKey, () => dbRef.current.get(id))

  useEffect(() => {
    console.log('useBlock.subscribe')
    const changes = dbRef.current
      .changes({
        since: 'now',
        live: true,
        doc_ids: [id],
      })
      .on('change', (change) => {
        console.log('useBlock.change', change)
        if (change.deleted) {
          // if the block is deleted, leave the cache at the last value
          // it is up to another query hook to "clean up" this block from the DOM
          changes.cancel()
          return
        }
        queryClient.invalidateQueries(queryKey)
      })
    return () => {
      console.log('useBlock.unsubscribe')
      changes.cancel()
    }
  }, [])

  return query
}
