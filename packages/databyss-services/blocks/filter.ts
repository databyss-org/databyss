import { Block } from '../interfaces'

/**
 * Returns a filter callback to find all terms with a prefix search.
 * @param query string to search, split into terms at spaces
 */
export const prefixSearchAll = (query: string) => (block: Block) =>
  query
    // only allow alphanumeric and space
    .replace(/[^a-z0-9 ]/gi, '')
    .split(' ')
    .reduce(
      (qacc: Boolean, qcurr: string) =>
        Boolean(
          qacc && block.text.textValue.match(new RegExp(`\\b${qcurr}`, 'i'))
        ),
      true
    )
