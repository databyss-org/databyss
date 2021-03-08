import PouchDB from 'pouchdb'
import { Page, Text } from '@databyss-org/services/interfaces'
import { searchText } from '../../utils'

export interface SearchEntriesResultRow {
  entryId: string
  text: Text
  index: number
  textScore: number
}

export interface SearchEntriesResultPage {
  entries: SearchEntriesResultRow[]
  maxTextScore: number
  pageName: string
  pageId: string
}

interface SearchRow {
  page: Page | null
  index: number
  text: Text
}

const searchEntries = async (
  encodedQuery: string,
  pages: Page[]
): Promise<SearchEntriesResultPage[]> => {
  const _query = decodeURIComponent(encodedQuery)

  const _res = await searchText(_query)

  const _queryResponse = _res.rows as PouchDB.SearchRow<SearchRow>[]
  if (!_queryResponse.length) {
    return []
  }
  // if results are found, look up page and append to result

  // create a dictionary of block to pages
  const _blockToPages: { [blockId: string]: { page: Page; index: number } } = {}

  pages.forEach((p) =>
    p.blocks.forEach((b, index) => (_blockToPages[b._id] = { page: p, index }))
  )

  // add page to block results
  for (const _result of _queryResponse) {
    const _entryId = _result.id
    const _page = _blockToPages[_entryId]?.page

    if (_page) {
      if (!_page.archive) {
        _result.doc.page = _page
        _result.doc.index = _blockToPages[_entryId]?.index
      } else {
        _result.doc.page = null
      }
    }
  }

  let _results = {}

  if (_queryResponse.length) {
    // normalize response
    const _searchResults = _queryResponse.map((q) => ({
      ...q.doc,
      score: q.score,
    }))

    let _resultsMap = _searchResults.reduce((acc, curr) => {
      // only show results with associated pages
      if (!curr.page) {
        return acc
      }
      const pageId = curr.page._id
      // get index where block appears on page
      if (!acc.get(pageId)) {
        // init result
        const _data: SearchEntriesResultPage = {
          pageName: curr.page.name,
          pageId,
          maxTextScore: curr.score,
          entries: [
            {
              entryId: curr._id,
              text: curr.text,
              index: curr.index,
              textScore: curr.score,
              //  blockId: curr.block,
            },
          ],
        }
        acc.set(pageId, _data)
      } else {
        const _data: SearchEntriesResultPage = acc.get(pageId)!
        const _entries = _data.entries

        // have the max test score on the page dictionary
        let _maxScore = _data.maxTextScore

        if (curr.score > _maxScore) {
          _maxScore = curr.score
        }

        _entries.push({
          entryId: curr._id,
          text: curr.text,
          index: curr.index,
          textScore: curr.score,
        })

        // sort the entries by text score
        _entries.sort((a, b) => (a.textScore < b.textScore ? 1 : -1))
        _data.entries = _entries
        _data.maxTextScore = _maxScore

        acc.set(pageId, _data)
      }
      return acc
    }, new Map<string, SearchEntriesResultPage>())

    // sort the map according to the text score per page
    _resultsMap = new Map<string, SearchEntriesResultPage>(
      [..._resultsMap].sort(([, v], [, v2]) => {
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
    _results = Object.fromEntries(_resultsMap)
  }

  return Object.values(_results)
}

export default searchEntries
