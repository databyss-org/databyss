/**
 * Converts a Databyss source detail object to a JSON CSL object.
 * See :
 * - https://docs.cloudcite.net/csl
 * - https://github.com/citation-style-language/schema/blob/master/schemas/input/csl-data.json
 *
 * @param {SourceDetail} source A Databyss source detail object.
 */
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
    // catalog identifiers
    isbn,
    issn,
    doi,
  } = source

  const response = {}

  // === TITLE ===
  if (validateTextValue(title)) {
    response.title = title.textValue
  } else {
    response.title = ''
  }

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
  if (publicationType && 'id' in publicationType) {
    response.type = publicationType.id
  }

  // publisher
  if (validateTextValue(publisherName)) {
    response.publisher = publisherName.textValue
  }

  // place
  if (validateTextValue(publisherPlace)) {
    response['publisher-place'] = publisherPlace.textValue
  }

  // year
  if ('yearPublished' in source && 'textValue' in source.yearPublished) {
    response.issued = {
      'date-parts': [[source.yearPublished.textValue]],
    }
  } else if ('year' in source && 'textValue' in source.year) {
    response.issued = {
      'date-parts': [[source.year.textValue]],
    }
  }

  // === CATALOG IDENTIFIERS ===
  if (validateTextValue(doi)) {
    response.DOI = doi.textValue
  }
  if (validateTextValue(issn)) {
    response.ISSN = issn.textValue
  }
  if (validateTextValue(isbn)) {
    response.ISBN = isbn.textValue
  }

  return response
}

function validateTextValue(prop) {
  if (prop && 'textValue' in prop && prop.textValue !== '') {
    return true
  }
  return false
}
