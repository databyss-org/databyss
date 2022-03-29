import { ResourcePending } from '../interfaces/ResourcePending'

export const urlSafeName = (name: string) =>
  name
    .replaceAll(/[^\p{L}\p{N}-]/gu, '-')
    .replaceAll(/-+/gu, '-')
    .replace(/-$/, '')
    .replace(/^-/, '')
    .trim()

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

export const resourceIsReady = (resource) =>
  resource &&
  !(resource instanceof ResourcePending) &&
  !(resource instanceof Error)

// TODO: extract and move to `packages/databyss-services/sources/lib` ?
export const getAuthorsFromSources = (blocks) =>
  blocks.reduce((dict, block) => {
    if (block.detail?.authors) {
      block.detail.authors.forEach((author) => {
        dict[
          `${author.firstName?.textValue || ''}${
            author.lastName?.textValue || ''
          }`
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

/**
 * Match any valid URI that starts with http:// or https://
 * Test it here: https://regexr.com/5jvei
 */
export const validUriRegex = /https?:\/\/[-a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF:.]{2,256}(\/?[-a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF@:%_+.~#&?/=,[\]();]*)?([-a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF@%_+~#&/=])/i

export const validURL = (str: string) => validUriRegex.test(str)
