export const getSourcesData = (sources, type, icon) =>
  sources &&
  Object.values(sources).map(value => {
    const author = value.authors?.[0]
    const firstName = author?.firstName?.textValue
    const lastName = author?.lastName?.textValue

    return {
      id: value._id,
      text:
        type === 'authors'
          ? author && `${lastName}${firstName && `, ${firstName}`}`
          : value.text.textValue,
      type,
      icon,
    }
  })

export const sortEntriesAtoZ = (sources, sortBy) =>
  sources.sort((a, b) => {
    if (sortBy) {
      return a[sortBy] > b[sortBy] ? 1 : -1
    }

    return a.text > b.text ? 1 : -1
  })

export const filterEntries = (entries, filterQuery) =>
  entries.filter(entry =>
    entry.text?.toLowerCase().includes(filterQuery.textValue.toLowerCase())
  )
