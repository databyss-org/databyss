import Hashids from 'hashids'
import { nanoid } from 'nanoid'

export const runtimeHash = nanoid()
const hashids = new Hashids(runtimeHash)
export default () => hashids.encode(new Date().getTime())
