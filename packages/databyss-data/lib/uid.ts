import { customAlphabet } from 'nanoid'

export const BASE62 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Generate a 12-character unique ID using all alphanumerics.
 * Assuming an average speed of 1000 IDs / hr across all Databyss instances,
 * the 12-character nanoid will take about almost 1000 years to have
 * a 1% chance of one collision¹.
 *
 * 1) see https://zelark.github.io/nano-id-cc/
 */
export const uid = () => customAlphabet(BASE62, 12)()

/**
 * Generate a 14-character unique ID using lowercase alphanumerics.
 * Assuming an average speed of 1000 IDs / hr across all Databyss instances,
 * the 14-character nanoid will take about almost 1000 years to have
 * a 1% chance of one collision¹.
 *
 * 1) see https://zelark.github.io/nano-id-cc/
 */
export const uidlc = () => customAlphabet(BASE36, 14)()
