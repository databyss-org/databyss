import Hashids from 'hashids'
import { nanoid } from 'nanoid'

// databyss IDs
// - are unique across all collections
// - should encode a timestamp
export const runtimeHash = nanoid()
const hashids = new Hashids(runtimeHash)
export const uid = () => hashids.encode(new Date().getTime())
