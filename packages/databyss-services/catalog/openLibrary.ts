import request from '../lib/request'
import { GroupedCatalogResults, CatalogService } from '../interfaces'
import { stripText as c } from './util'

const openLibrary: CatalogService = {
  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.docs,
  getAuthors: (apiResult: any) => c(apiResult.author_name || []),
  getTitle: (apiResult: any) => c(apiResult.title),
  getSubtitle: (apiResult: any) => c(apiResult.subtitle),
  getPublishedYear: (apiResult: any) => apiResult.first_publish_year,
}

export default openLibrary
