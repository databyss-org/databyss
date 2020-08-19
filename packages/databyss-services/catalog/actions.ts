import * as googleBooks from './googleBooks'
import { SEARCH_CATALOG, CACHE_SEARCH_RESULTS } from './constants'
import { CatalogType, NetworkUnavailableError } from '../interfaces'

const serviceMap: { [type: string]: any } = {
  [CatalogType.GoogleBooks]: googleBooks,
}

export function searchCatalog({
  type,
  query,
}: {
  type: CatalogType
  query: string
}) {
  return async (dispatch: Function) => {
    dispatch({
      type: SEARCH_CATALOG,
      payload: { type, query },
    })

    try {
      const results = await serviceMap[type].search(query)
      dispatch({
        type: CACHE_SEARCH_RESULTS,
        payload: {
          query,
          type,
          results,
        },
      })
    } catch (error) {
      // if offline
      if (error instanceof NetworkUnavailableError) {
        dispatch({
          type: CACHE_SEARCH_RESULTS,
          payload: {
            query,
            type,
            results: [],
          },
        })
      } else {
        throw error
      }
    }
  }
}
