import PouchDB from 'pouchdb'
import {
  Block,
  BlockType,
  DocumentDict,
  IndexPageResult,
  Page,
  Text,
} from '@databyss-org/services/interfaces'
import { searchText } from '../../utils'
import cloneDeep from 'clone-deep'
import { populatePage } from '../../../../databyss-services/blocks/joins'
import { indexPage } from '../../../../databyss-editor/lib/util'

export interface SearchEntriesResultRow {
  entryId: string
  type: BlockType
  text: Text
  index: number
  textScore: number
  activeHeadings?: IndexPageResult[]
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
  type: BlockType
  activeHeadings?: IndexPageResult[]
}

const searchEntries = async (
  encodedQuery: string,
  pages: Page[],
  blocks: DocumentDict<Block>
): Promise<SearchEntriesResultPage[]> => {
  const _query = decodeURIComponent(encodedQuery)

  const _res = await searchText(_query)

  const _queryResponse = _res.rows as PouchDB.SearchRow<SearchRow>[]
  if (!_queryResponse.length) {
    return []
  }
  // if results are found, look up page and append to result

  // create a dictionary of block to pages
  const _blockToPages: {
    [blockId: string]: {
      page: Page
      index: number
    }[]
  } = {}

  pages.forEach((p) =>
    p.blocks.forEach((b, index) => {
      if (b.type.match(/^END_/)) {
        return
      }
      if (!_blockToPages[b._id]) {
        _blockToPages[b._id] = []
      }
      _blockToPages[b._id].push({ page: p, index })
    })
  )

  // expand results
  const _expandedQueryResponse: PouchDB.SearchRow<SearchRow>[] = []
  for (const _result of _queryResponse) {
    const _entryId = _result.id
    const _pages = _blockToPages[_entryId]

    if (_pages) {
      _pages.forEach(({ page, index }) => {
        if (page.archive) {
          return
        }
        const _populatedPage = populatePage({ page, blocks })
        const _indexedPage = indexPage({
          pageId: page._id,
          blocks: _populatedPage.blocks,
        })
        const _expandedSearchRow = cloneDeep(_result)
        _expandedSearchRow.doc.page = page
        _expandedSearchRow.doc.index = index
        _expandedSearchRow.doc.activeHeadings = _indexedPage.find(
          (p) => p.blockIndex === index
        )?.activeHeadings
        _expandedQueryResponse.push(_expandedSearchRow)
      })
    }
  }

  let _results = {}

  if (_expandedQueryResponse.length) {
    // normalize response
    const _searchResults = _expandedQueryResponse.map((q) => ({
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
              type: curr.type,
              text: curr.text,
              index: curr.index,
              textScore: curr.score,
              activeHeadings: curr.activeHeadings,
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
          type: curr.type,
          activeHeadings: curr.activeHeadings,
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
