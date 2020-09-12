import { ResourcePending } from '../interfaces/ResourcePending'

export const resourceIsReady = resource =>
  resource &&
  !(resource instanceof ResourcePending) &&
  !(resource instanceof Error)

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
