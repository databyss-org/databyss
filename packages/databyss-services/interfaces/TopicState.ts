import { CacheDict, NullableCache } from './'
import { Topic } from './Block'

export interface TopicState {
  cache: CacheDict<Topic>
  headerCache: NullableCache<Topic>
}
