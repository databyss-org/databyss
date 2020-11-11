import request from '../lib/request'
import { GroupedCatalogResults, CatalogService } from '../interfaces'
import { stripText as c } from './util';

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
  getAuthors: (apiResult: any) => c(apiResult.volumeInfo.authors || []),
  getTitle: (apiResult: any) => c(apiResult.volumeInfo.title),
  getSubtitle: (apiResult: any) => c(apiResult.volumeInfo.subtitle),
  getPublisher: (apiResult: any) =>  c(apiResult.volumeInfo.publisher),
  getPublishedYear: (apiResult: any) =>
    apiResult.volumeInfo.publishedDate?.substring(0, 4),
}

export default googleBooks
