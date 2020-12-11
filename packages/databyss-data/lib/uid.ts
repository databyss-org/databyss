import Hashids from 'hashids'
import { nanoid } from 'nanoid'

interface Counter {
  count: number
}

// databyss IDs
// - are unique across all collections
// - should encode a timestamp
const _runtimeHash = nanoid()
const _runtimeCounter = { count: 0 }
const _hashids = new Hashids(_runtimeHash)
export const uid = (
  hashids: Hashids = _hashids,
  counter: Counter = _runtimeCounter
) => {
  counter.count += 1
  return hashids.encode(`${new Date().getTime()}${counter.count}`)
}
