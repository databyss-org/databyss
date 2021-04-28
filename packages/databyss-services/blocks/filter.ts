import { BlockType, Source, Topic } from '../interfaces'

/**
 * Returns a filter callback to find all terms with a prefix search.
 * @param query string to search, split into terms at spaces
 */
export const prefixSearchAll = (query: string) => (block: Source & Topic) => {
  let _text = block.text.textValue
  if (block.type === BlockType.Source && block?.name?.textValue) {
    // use `name` for the filtered suggestion
    _text = block.name.textValue
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
