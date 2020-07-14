export const getSourcesData = (sources, type, icon) =>
  sources &&
  Object.values(sources).map(value => ({
    id: value._id,
    text: value.text.textValue,
    type,
    icon,
  }))

export const sortEntriesAtoZ = (entries, sortBy) =>
  entries.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))

export const filterEntries = (entries, filterQuery) =>
  entries.filter(entry =>
    entry.text?.toLowerCase().includes(filterQuery.textValue.toLowerCase())
  )
