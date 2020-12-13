import { customAlphabet } from 'nanoid'

export const BASE62 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

/**
 * Generate a 12-character unique ID. Assuming an average speed of 1000 IDs / hr across
 * all Databyss instances, the 12-character nanoid will take about almost 1000 years to have
 * a 1% chance of one collision¹.
 *
 * 1) see https://zelark.github.io/nano-id-cc/
 */
export const uid = () => customAlphabet(BASE62, 12)()
