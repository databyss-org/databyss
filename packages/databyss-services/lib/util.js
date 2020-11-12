import { ResourcePending } from '../interfaces/ResourcePending'

export const resourceIsReady = resource =>
  resource &&
  !(resource instanceof ResourcePending) &&
  !(resource instanceof Error)

// TODO: extract and move to `packages/databyss-services/sources/lib` ?
export const getAuthorsFromSources = blocks =>
  blocks.reduce((dict, block) => {
    if (block.detail?.authors) {
      block.detail.authors.forEach(author => {
        dict[
          `${author.firstName?.textValue || ''}${author.lastName?.textValue ||
            ''}`
        ] = { ...author, isInPages: block?.isInPages }
      })
    }
    return dict
  }, {})

export async function asyncForEach(array, callback) {
  /* eslint-disable no-plusplus */
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
  /* eslint-enable no-plusplus */
}
