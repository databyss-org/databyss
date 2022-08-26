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

export const sortEntriesAtoZ = (entries, sortBy) =>
  [...entries]?.sort((a, b) =>
    a[sortBy]
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') >
    b[sortBy]
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      ? 1
      : -1
  )

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
