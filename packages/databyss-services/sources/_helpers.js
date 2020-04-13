// composes google results into a dictionary with author as the key
export const composeResults = results => {
  let _results = {}
  _results = results.items.reduce((acc, curr) => {
    const _authors = curr.volumeInfo.authors
    if (_authors) {
      _authors.forEach(a => {
        if (!acc[a]) {
          acc[a] = [curr]
        } else {
          const _curr = acc[a]
          _curr.push(curr)
          acc[a] = _curr
        }
      })
    }
    return acc
  }, _results)

  return _results
}
