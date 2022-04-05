export { prefixSearchAll, weightedSearch } from './filter'
export { joinBlockRelations } from './joins'
export { makeText } from './makeText'
export { textToHtml } from './serialize'
export { groupBlockRelationsByPage } from './aggregate'
export { mergeRanges, SortOptions } from './textRanges'

export const getAtomicClosureText = (type, text) =>
  ({
    END_SOURCE: `/@ ${text}`,
    END_TOPIC: `/# ${text}`,
  }[type])
