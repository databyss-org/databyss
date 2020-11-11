import request from '../lib/request'
import { GroupedCatalogResults, CatalogService } from '../interfaces'
import { stripText as c, getCatalogSearchType } from './util';

const crossref: CatalogService = {
  search: async (query: string): Promise<GroupedCatalogResults> => {
    let _baseUri = "https://api.crossref.org/works?query="

    if(getCatalogSearchType(query) === 'DOI'){
      _baseUri =`https://api.crossref.org/works/`
    }

    let _uri = `${_baseUri}${!getCatalogSearchType(query) ?encodeURIComponent(query): query}`
    if (process.env.CITEBOT_EMAIL && !getCatalogSearchType(query)) {
      _uri += `&mailto=${process.env.CITEBOT_EMAIL}`
    }
    const results = await request(_uri)
    return results
  },
  getResults: (apiResults: any) => apiResults.message.items || [apiResults.message],
  getAuthors: (apiResult: any) => c((apiResult.author || []).map(authorName)),
  getTitle: (apiResult: any) => c(apiResult.title ? apiResult.title[0] : ''),
  getSubtitle: (apiResult: any) => c(apiResult.subtitle?.[0]),
  getPublisher: (apiResult: any) => c(apiResult.publisher),
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