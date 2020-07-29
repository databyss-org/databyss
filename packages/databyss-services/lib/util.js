import { ResourcePending } from '../interfaces/ResourcePending'

export const resourceIsReady = resource =>
  resource &&
  !(resource instanceof ResourcePending) &&
  !(resource instanceof Error)

export const getAuthorsFromSources = blocks =>
  blocks.reduce((dict, block) => {
    if (block.detail) {
      block.detail.authors.forEach(a => {
        const firstName = a.firstName?.textValue
        const lastName = a.lastName?.textValue

        if (firstName && lastName) {
          return (dict[firstName + lastName] = a)
        }
        if (firstName || lastName) {
          return (dict[firstName || lastName] = a)
        }
        return ''
      })
    }
    return dict
  }, {})
