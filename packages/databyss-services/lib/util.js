import { ResourcePending } from '../interfaces/ResourcePending'

export const resourceIsReady = (resource) =>
  resource &&
  !(resource instanceof ResourcePending) &&
  !(resource instanceof Error)

export async function asyncForEach(array, callback) {
  /* eslint-disable no-plusplus */
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
  /* eslint-enable no-plusplus */
}
