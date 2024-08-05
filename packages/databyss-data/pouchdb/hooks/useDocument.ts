import { useEffect, useRef } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Document } from '@databyss-org/services/interfaces'
import { EM } from '@databyss-org/data/pouchdb/utils'

import { dbRef } from '../db'

export interface UseDocumentOptions {
  enabled?: boolean
  initialData?: any
  subscribe?: boolean
  previousIfNull?: boolean
  previousDeps?: any[]
  queryKey?: string[]
}

export function applyDefaultUseDocumentOptions(
  options: UseDocumentOptions = {}
) {
  return {
    enabled: options.enabled ?? true,
    initialData: options.initialData ?? null,
    subscribe: options.subscribe ?? true,
  }
}

export const useDocument = <T extends Document>(
  _id: string,
  options: UseDocumentOptions = {}
) => {
  const queryKey = [`useDocument_${_id}`]
  const _options = applyDefaultUseDocumentOptions(options)
  const prevQuery = useRef<UseQueryResult<T, Error> | null>(null)

  useEffect(() => {
    EM.process()
  }, [])

  const query = useQuery<T>({
    queryKey,
    queryFn: () =>
      new Promise<T>((resolve, reject) => {
        if (!_id) {
          resolve(null)
          return
        }
        dbRef
          .current!.get(_id)
          .then((res) => resolve(res))
          .catch((err) => {
            console.log('[useDocument] fetch failed', queryKey, err)
            reject(err)
          })
      }),
    enabled: _options.enabled,
    initialData: options?.initialData,
  })

  useEffect(() => {
    prevQuery.current = null
  }, [options?.previousDeps])

  if (!query.data && options.previousIfNull && prevQuery.current) {
    return prevQuery.current
  }

  prevQuery.current = query

  return query
}
