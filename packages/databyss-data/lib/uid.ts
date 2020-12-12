import { customAlphabet } from 'nanoid'

/**
 * Generate a 12 character UID that has < 1% chance of collision¹ across all Databyss instances.
 *
 * ```
 *`0ql87rp Ijdjz`
 *|-------|       Timestamp to nearest second -> base-36 -> pad to 7 chars
 *        |-----| Cryptographically random 5 character string
 * ```
 * 1) https://zelark.github.io/nano-id-cc/
 */
export const uid = () =>
  Math.floor(new Date().getTime() / 1000)
    .toString(36)
    .padStart(7, '0') +
  customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    5
  )()
