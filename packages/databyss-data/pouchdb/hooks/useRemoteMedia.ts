import { useQuery } from 'react-query'

export interface QueryOptions {
  includeIds?: string[] | null
}

export interface UseDocumentsOptions extends QueryOptions {
  enabled?: boolean
}

export const useRemoteMedia = (
  // should be url
  url: string,
  options: UseDocumentsOptions = { enabled: true }
) => {
  const queryKey = url

  const query = useQuery(
    queryKey,
    () =>
      new Promise((resolve, reject) => {
        // fetch media
        fetch(queryKey)
          .then((res: any) => {
            console.log(res.headers.get('Content-Disposition'))
            console.log(res.headers.get('Content-Type'))
            return resolve(console.log(res.json()))
          })
          .catch((err) => reject(err))
      }),
    {
      enabled: options.enabled,
    }
  )

  return query
}
