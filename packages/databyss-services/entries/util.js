import { unorm } from '@databyss-org/data/couchdb-client/couchdb'

export const createIndexPageEntries = ({
  text,
  type,
  id,
  citations,
  ...others
}) =>
  // {
  //   text: string,
  //   type: 'sources' | 'authors' | 'topics' | 'pages',
  //   id: number | string,
  // }
  ({
    text,
    type,
    citations,
    id,
    ...others,
  })

export const startsWithEmoji = (text) =>
  text.match(
    /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/
  )

export const sortEntriesAtoZ = (entries, sortBy) =>
  [...entries]?.sort((a, b) => {
    const _a = a[sortBy] ?? ''
    const _b = b[sortBy] ?? ''
    if (startsWithEmoji(_b) && !startsWithEmoji(_a)) {
      return 1
    }
    if (startsWithEmoji(_a) && !startsWithEmoji(_b)) {
      return -1
    }
    return unorm(_a).toLowerCase() > unorm(_b).toLowerCase() ? 1 : -1
  })

export const sortEntriesByRecent = (entries, sortBy) =>
  [...entries]?.sort((a, b) => {
    const _a = a[sortBy] ?? ''
    const _b = b[sortBy] ?? ''
    const _txtA = _a?.text?.textValue ?? _a?.name ?? ''
    const _txtB = _b?.text?.textValue ?? _b?.name ?? ''
    if (startsWithEmoji(_txtB) && !startsWithEmoji(_txtA)) {
      return 1
    }
    if (startsWithEmoji(_txtA) && !startsWithEmoji(_txtB)) {
      return -1
    }
    return (
      (_b.accessedAt ?? _b.modifiedAt ?? _b.createdAt) -
      (_a.accessedAt ?? _a.modifiedAt ?? _a.createdAt)
    )
  })

export const filterEntries = (entries, filterQuery) => {
  const findEntry = (query) => (entry) =>
    unorm(query)
      .split(' ')
      .reduce(
        (qacc, qcurr) =>
          Boolean(
            qacc &&
              (unorm(entry.text).match(new RegExp(`\\b${qcurr}`, 'i')) ||
                unorm(entry?.name ?? '').match(new RegExp(`\\b${qcurr}`, 'i')))
          ),
        true
      )
  return entries.filter(findEntry(filterQuery))
}

export const optimizeBlockRelations = (blockRelationsArray) => {
  // get the latest value in the array

  const _filteredBlockArray = []
  /*
  reverse the array, get the last match and push it to an array
  */
  blockRelationsArray.reverse().forEach((b) => {
    // if clear block relations push to array
    if (b.clearPageRelationships) {
      _filteredBlockArray.push(b)
    } else {
      // find matching relatedBlock and block
      b.blocksRelationArray.forEach((a) => {
        if (
          !_filteredBlockArray.some((i) =>
            i.blocksRelationArray.some(
              (j) => j.relatedBlock === a.relatedBlock && j.block === a.block
            )
          )
        ) {
          // if not found in array, push to array
          _filteredBlockArray.push(b)
        }
      })
    }
  })

  return _filteredBlockArray.reverse()
}
