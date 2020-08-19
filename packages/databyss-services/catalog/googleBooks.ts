import ObjectId from 'bson-objectid'
import request from '../lib/request'
import {
  GroupedCatalogResults,
  Text,
  CatalogService,
  Source,
  BlockType,
} from '../interfaces'

const service: CatalogService = {
  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyCCoJxl3VhVwvM4v4cHSPJY6hsK-kh5VBk`
    )
    return results
  },
  /**
   * composes suggestion title
   * @param result google books API result
   */
  titleFromResult: (result: any): Text => {
    const _text: Text = {
      textValue: result.volumeInfo.title,
      ranges: [],
    }

    if (result.volumeInfo.subtitle) {
      _text.textValue += `: ${result.volumeInfo.subtitle}`
    }

    _text.ranges = [
      {
        offset: 0,
        length: _text.textValue.length,
        marks: ['italic'],
      },
    ]

    if (result.volumeInfo.publishedDate) {
      _text.textValue += ` (${result.volumeInfo.publishedDate.substring(0, 4)})`
    }

    return _text
  },
  getResults: (apiResults: any) => apiResults.items,
  getAuthors: (apiResult: any) => apiResult.volumeInfo.authors || [],
  getTitle: (apiResult: any) => apiResult.volumeInfo.title,
  getSubtitle: (apiResult: any) => apiResult.volumeInfo.subtitle,
}

export default service
