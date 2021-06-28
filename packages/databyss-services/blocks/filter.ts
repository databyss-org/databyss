import { fuzzysearch } from 'scored-fuzzysearch'

import { Source, Topic } from '../interfaces'

/**
 * Returns a filter callback to find all terms with a prefix search.
 * @param query string to search, split into terms at spaces
 */
export const prefixSearchAll = (query: string, searchPredicate?: string) => (
  block: Source & Topic
) => {
  let _text = block?.text?.textValue

  if (searchPredicate) {
    if (block[searchPredicate]?.textValue || block[searchPredicate]) {
      // use `name` for the filtered suggestion
      _text = block[searchPredicate]?.textValue || block[searchPredicate]
    } else {
      return false
    }
  }

  return (
    query
      // only allow alphanumeric and space
      .replace(/[^a-z0-9 ]/gi, '')
      .split(' ')
      .reduce(
        (qacc: Boolean, qcurr: string) =>
          Boolean(qacc && _text.match(new RegExp(`\\b${qcurr}`, 'i'))),
        true
      )
  )
}

/**
 *
 * @param query add weight score to suggest search results
 * @param searchPredicate
 */
export const weightedSearch = (query: string, searchPredicate?: string) => (
  block: Source & Topic
) => {
  let _text = block?.text?.textValue

  if (searchPredicate) {
    if (block[searchPredicate]?.textValue || block[searchPredicate]) {
      // use `name` for the filtered suggestion
      _text = block[searchPredicate]?.textValue || block[searchPredicate]
    } else {
      return { ...block, weight: 0 }
    }
  }

  let _weight = fuzzysearch(query, _text)

  // if exact match, weight heavy
  if (_weight === true) {
    _weight = 10
  }
  return { ...block, weight: _weight }
}
