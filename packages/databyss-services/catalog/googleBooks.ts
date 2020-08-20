import request from '../lib/request'
import { GroupedCatalogResults, CatalogService } from '../interfaces'

const googleBooks: CatalogService = {
  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&key=AIzaSyCCoJxl3VhVwvM4v4cHSPJY6hsK-kh5VBk`
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.items,
  getAuthors: (apiResult: any) => apiResult.volumeInfo.authors || [],
  getTitle: (apiResult: any) => apiResult.volumeInfo.title,
  getSubtitle: (apiResult: any) => apiResult.volumeInfo.subtitle,
  getPublishedYear: (apiResult: any) =>
    apiResult.volumeInfo.publishedDate.substring(0, 4),
}

export default googleBooks
