// see :
// - https://docs.cloudcite.net/csl
// - https://github.com/citation-style-language/schema/blob/master/schemas/input/csl-data.json

export const toJsonCsl = source => {
  if (!source) {
    return null
  }

  const {
    title,
    // people
    authors,
    editors,
    translators,
    // publication
    publicationType,
    publisherName,
    publisherPlace,
    yearPublished,
    // catalog identifiers
    isbn,
    issn,
    doi,
  } = source

  const response = {}

  // === TITLE ===
  response.title = title.textValue

  // === PEOPLE ===

  // authors
  if (authors && Array.isArray(authors) && authors.length > 0) {
    response.author = []
    authors.forEach(a => {
      response.author.push({
        given: a.firstName.textValue,
        family: a.lastName.textValue,
      })
    })
  }

  // editors
  if (editors && Array.isArray(editors) && editors.length > 0) {
    response.editor = []
    editors.forEach(e => {
      response.editor.push({
        given: e.firstName.textValue,
        family: e.lastName.textValue,
      })
    })
  }

  // translators
  if (translators && Array.isArray(translators) && translators.length > 0) {
    response.translator = []
    translators.forEach(t => {
      response.translator.push({
        given: t.firstName.textValue,
        family: t.lastName.textValue,
      })
    })
  }

  // === PUBLICATION ===

  // publication type
  // TODO: ensure if acceptable type
  if (publicationType) {
    response.type = publicationType.id
  }

  // publisher
  if (publisherName) {
    response.publisher = publisherName.textValue
  }

  // place
  if (publisherPlace) {
    response['publisher-place'] = publisherPlace.textValue
  }

  // year
  // FIXME: year doesnt get parsed properly
  if (yearPublished) {
    response.issued = {
      'date-parts': [[yearPublished.textValue]],
    }
  }

  // === CATALOG IDENTIFIERS ===
  if (doi && doi.textValue !== '') {
    response.DOI = doi.textValue
  }
  if (issn && issn.textValue !== '') {
    response.ISSN = issn.textValue
  }
  if (isbn && isbn.textValue !== '') {
    response.ISBN = isbn.textValue
  }

  return response
}
