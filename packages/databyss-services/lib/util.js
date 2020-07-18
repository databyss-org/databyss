import { ResourcePending } from '../interfaces'

export const resourceIsReady = resource =>
  resource &&
  !(resource instanceof ResourcePending) &&
  !(resource instanceof Error)

export const getAuthorsFromSources = blocks =>
  blocks.reduce((dict, block) => {
    if (block.detail) {
      block.detail.authors.forEach(a => {
        dict[a.firstName.textValue + a.lastName.textValue] = a
      })
    }
    return dict
  }, {})
