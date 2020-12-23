import { db } from '../../db'
import { DocumentType, BlockType } from '../../../interfaces'

const searchEntries = async (encodedQuery: string) => {
  const _query = decodeURIComponent(encodedQuery)

  // calculate how strict we want the search to be

  // will require at least one word to be in the results
  const _queryLength = _query.split(' ').length
  let _percentageToMatch = 1 / _queryLength
  _percentageToMatch = +_percentageToMatch.toFixed(3)
  _percentageToMatch *= 100
  _percentageToMatch = +_percentageToMatch.toFixed(0)

  const _res = await db.search({
    query: _query,
    fields: ['text.textValue'],
    include_docs: true,
    filter: (doc) => doc.type === BlockType.Entry,
    // TODO: FIGURE OUT HOW STRICT WE WANT THE SERACH
    mm: `${_percentageToMatch}%`,
  })

  const _queryResponse = _res.rows
  // if results are found, look up page and append to result
  if (_queryResponse.length) {
    const _results = _queryResponse
    for (const _result of _results) {
      // returns all pages where source id is found in element id
      const _response = await db.find({
        selector: {
          documentType: DocumentType.Page,
          blocks: {
            $elemMatch: {
              _id: _result.id,
            },
          },
        },
      })
      if (_response.docs.length) {
        // only one search result should appear per entry
        const _page = _response.docs[0]
        if (_page && !_page?.archive) {
          // if page has not been archived and is currently not in array, push to array
          _result.doc.page = _page
        } else {
          _result.doc.page = null
        }
      }
    }
  }

  let __results = {
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

        //     acc.results[pageId] = _data
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
