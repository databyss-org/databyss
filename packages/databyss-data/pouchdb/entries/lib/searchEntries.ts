import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { PageDoc } from '../../interfaces'
import { searchText } from '../../utils'

const searchEntries = async (
  encodedQuery: string,
  pages: PageDoc[]
): Promise<
  | ResourceNotFoundError
  | {
      count: number
      results: any
    }
> => {
  const _query = decodeURIComponent(encodedQuery)

  const _res = await searchText(_query)

  const _queryResponse = _res.rows
  if (!_queryResponse.length) {
    return new ResourceNotFoundError('no results found')
  }
  // if results are found, look up page and append to result

  const _results = _queryResponse

  // create a dictionary of block to pages
  const _blockToPages = {}

  Object.values(pages).forEach((p) =>
    p.blocks.forEach((b) => (_blockToPages[b._id] = { pageId: p._id }))
  )

  // add page to block results
  for (const _result of _results) {
    let _page
    const _entryId = _result.id
    const _pageId = _blockToPages[_entryId]?.pageId
    // pageId might not exist if block was deleted
    if (_pageId) {
      _page = pages[_pageId]
    }

    if (_page) {
      // only one search result should appear per entry
      if (_page && !_page?.archive) {
        // if page has not been archived and is currently not in array, push to array
        _result.doc.page = _page
      } else {
        _result.doc.page = null
      }
    }
  }

  let __results: { count: number; results: any } = {
    count: 0,
    results: {},
  }

  if (_queryResponse.length) {
    // normalize response
    const _searchResults = _queryResponse.map((q) => ({
      ...q.doc,
      score: q.score,
    }))

    __results = {
      count: _searchResults.length,
      results: new Map(),
    }

    __results = _searchResults.reduce((acc, curr) => {
      // only show results with associated pages
      if (!curr.page) {
        __results.count -= 1
        return acc
      }
      const pageId = curr.page._id
      // get index where block appears on page
      const _blockIndex = curr.page.blocks.findIndex((b) => b._id === curr._id)
      if (!acc.results.get(pageId)) {
        // init result
        const _data = {
          page: curr.page.name,
          pageId,
          maxTextScore: curr.score,
          entries: [
            {
              entryId: curr._id,
              text: curr.text,
              index: _blockIndex,
              textScore: curr.score,
              //  blockId: curr.block,
            },
          ],
        }
        acc.results.set(pageId, _data)
      } else {
        const _data = acc.results.get(pageId)
        const _entries = _data.entries

        // have the max test score on the page dictionary
        let _maxScore = _data.maxTextScore

        if (curr.score > _maxScore) {
          _maxScore = curr.score
        }

        _entries.push({
          entryId: curr._id,
          text: curr.text,
          index: _blockIndex,
          textScore: curr.score,
        })

        // sort the entries by text score
        _entries.sort((a, b) => (a.textScore < b.textScore ? 1 : -1))
        _data.entries = _entries
        _data.maxTextScore = _maxScore

        acc.results.set(pageId, _data)
      }
      return acc
    }, __results)

    // sort the map according to the text score per page
    __results.results = new Map(
      [...__results.results].sort(([, v], [, v2]) => {
        if (v.maxTextScore < v2.maxTextScore) {
          return 1
        }
        if (v.maxTextScore > v2.maxTextScore) {
          return -1
        }
        return 0
      })
    )

    // convert from map back to object
    __results = {
      ...__results,
      results: Object.fromEntries(__results.results),
    }
  }

  return __results
}

export default searchEntries
