// composes google results into a dictionary with author as the key
export const composeResults = (results, query) => {
  const _query = query.toLowerCase()

  // query must be included in title, subtitile or author
  const _filteredResults = results.items.filter(q => {
    const _inTitle = q.volumeInfo.title
      .split(' ')
      .reduce(
        (acc, curr) => acc || _query.search(curr.toLowerCase()) > -1,
        false
      )

    const _inSubtitle = q.volumeInfo.subtitle
      ? q.volumeInfo.subtitle.toLowerCase().search(_query) > -1
      : false

    const _inAuthor = q.volumeInfo.authors
      ? q.volumeInfo.authors.filter(
          a =>
            _query
              .split(' ')
              .filter(s => (s.length ? a.toLowerCase().search(s) > -1 : false))
              .length > 0
        ).length > 0
      : false

    return _inTitle || _inSubtitle || _inAuthor
  })

  let _results = {}
  // organizes according to author(s)
  _results = _filteredResults.reduce((acc, curr) => {
    const _authors = curr.volumeInfo.authors
    if (_authors) {
      const _authorsString =
        _authors.length > 1 ? _authors.join(', ') : _authors[0]
      if (!acc[_authorsString]) {
        acc[_authorsString] = [curr]
      } else {
        const _curr = acc[_authorsString]
        // checks for duplicates
        const _isDuplicated =
          _curr.filter(
            () =>
              acc[_authorsString].filter(
                _vol => _vol.volumeInfo.title === curr.volumeInfo.title
              ).length > 0
          ).length > 0

        // if not a duplicate, push to author array
        if (!_isDuplicated) {
          _curr.push(curr)
          acc[_authorsString] = _curr
        }
      }
    }
    return acc
  }, _results)

  return _results
}
