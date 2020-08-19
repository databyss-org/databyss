import request from '../lib/request'
import { GroupedCatalogResults, Text, CatalogResult } from '../interfaces'

export const search = async (query: string): Promise<GroupedCatalogResults> => {
  const results = await request(
    `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyCCoJxl3VhVwvM4v4cHSPJY6hsK-kh5VBk`
  )
  return composeResults({ results, query })
}

function titleFromVolume(volume: any): Text {
  const _text: Text = {
    textValue: volume.volumeInfo.title,
    ranges: [],
  }

  if (volume.volumeInfo.subtitle) {
    _text.textValue += `: ${volume.volumeInfo.subtitle}`
  }

  _text.ranges = [
    {
      offset: 0,
      length: _text.textValue.length,
      marks: ['italic'],
    },
  ]

  if (volume.volumeInfo.publishedDate) {
    _text.textValue += ` (${volume.volumeInfo.publishedDate.substring(0, 4)})`
  }

  return _text
}

// composes google results into a dictionary with author as the key
function composeResults({
  results,
  query,
}: {
  results: any
  query: string
}): GroupedCatalogResults {
  const _query = query.toLowerCase()

  if (!results.items) {
    return {}
  }

  // query must be included in title, subtitile or author
  const _filteredResults = results.items.filter(q => {
    const _authors = q.volumeInfo.authors || []
    return [q.volumeInfo.title, q.volumeInfo.subtitle]
      .concat(_authors)
      .reduce(
        (acc, curr) =>
          acc || (curr && curr.match(new RegExp(`\\b${_query}`, 'i'))),
        false
      )
  })

  if (!_filteredResults) {
    return {}
  }

  // organizes according to author(s)
  const _titles: { [title: string]: any } = {} // dedupe dict for titles
  const _groupedResults: GroupedCatalogResults = {}
  _filteredResults.forEach((_vol: any) => {
    const _authors = _vol.volumeInfo.authors || []
    const _authorsString = _authors.join(', ')
    const _result: CatalogResult = {
      title: titleFromVolume(_vol),
      meta: _vol,
    }

    // if not a duplicate, push to author array
    if (!_titles[_result.title.textValue]) {
      _groupedResults[_authorsString] = (
        _groupedResults[_authorsString] || []
      ).concat(_result)
      _titles[_result.title.textValue] = _vol
    }
  })

  return _groupedResults
}
