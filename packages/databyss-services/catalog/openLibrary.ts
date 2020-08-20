import request from '../lib/request'
import { GroupedCatalogResults, CatalogService } from '../interfaces'

const openLibrary: CatalogService = {
  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.docs,
  getAuthors: (apiResult: any) => apiResult.author_name || [],
  getTitle: (apiResult: any) => apiResult.title,
  getSubtitle: (apiResult: any) => apiResult.subtitle,
  getPublishedYear: (apiResult: any) => apiResult.first_publish_year,
}

export default openLibrary
