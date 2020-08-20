import request from '../lib/request'
import { GroupedCatalogResults, CatalogService } from '../interfaces'

const crossref: CatalogService = {
  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request(
      `https://api.crossref.org/works?query=${encodeURIComponent(query)}`,
      { includeUserAgent: true }
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.message.items,
  getAuthors: (apiResult: any) => (apiResult.author || []).map(authorName),
  getTitle: (apiResult: any) => apiResult.title ? apiResult.title[0] : '',
  getSubtitle: (apiResult: any) => apiResult.subtitle?.[0],
  getPublishedYear: (apiResult: any) => {
    return apiResult.issued?.['date-parts']?.[0]?.[0] ||
      apiResult['published-print']?.['date-parts']?.[0]?.[0] ||
      apiResult['published-online']?.['date-parts']?.[0]?.[0] ||
      apiResult['approved']?.['date-parts']?.[0]?.[0] ||
      apiResult['created']?.['date-parts']?.[0]?.[0]
  },
}

export default crossref

function authorName(crossrefAuthor: any): string {
  let _name = ''
  if (crossrefAuthor.given) {
    _name += crossrefAuthor.given
  }
  if (crossrefAuthor.family) {
    if (_name.length) {
      _name += ' '
    }
    _name  += crossrefAuthor.family
  }
  return _name
}