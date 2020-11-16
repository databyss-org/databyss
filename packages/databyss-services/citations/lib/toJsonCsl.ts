import { isEqual } from 'lodash'

import { defaultMonthOption } from '../../sources/constants/MonthOptions'

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
    // publication details (articles)
    journalTitle,
    volume,
    issue,
    // catalog identifiers (book)
    isbn,
    // catalog identifiers (articles)
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
  if (validatePeopleArray(source, 'authors')) {
    response.author = []
    authors.forEach(a => {
      response.author.push({
        given: a.firstName?.textValue,
        family: a.lastName?.textValue,
      })
    })
  }

  // editors
  if (validatePeopleArray(source, 'editors')) {
    response.editor = []
    editors.forEach(e => {
      response.editor.push({
        given: e.firstName?.textValue,
        family: e.lastName?.textValue,
      })
    })
  }

  // translators
  if (validatePeopleArray(source, 'translators')) {
    response.translator = []
    translators.forEach(t => {
      response.translator.push({
        given: t.firstName?.textValue,
        family: t.lastName?.textValue,
      })
    })
  }

  // === PUBLICATION ===

  // date
  const dateParts = buildDateParts(source)
  if (dateParts) {
    response.issued = {
      'date-parts': dateParts,
    }
  }


  // publication type
  if (validateOption(source, 'publicationType')) {
    // TODO: ensure if acceptable type
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

  // journal title
  console.log('journalTitle:', journalTitle);
  if (validateTextValue(journalTitle)) {
    response['container-title'] = journalTitle.textValue
  }

  // volume
  if (validateTextValue(volume)) {
    response.volume = volume.textValue
  }

  // issue
  if (validateTextValue(issue)) {
    response.issue = issue.textValue
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

  console.log('csl:', response);

  return response
}

// utils
function buildDateParts(source) {
  let year = null
  if (
    'yearPublished' in source &&
    'textValue' in source.yearPublished &&
    source.yearPublished.textValue !== ''
  ) {
    year = source.yearPublished.textValue
  } else if (
    'year' in source &&
    'textValue' in source.year &&
    source.year.textValue !== ''
  ) {
    year = source.year.textValue
  }

  let month = null
  if (
    validateOption(source, 'month') &&
    !isEqual(source.month.id, defaultMonthOption)
  ) {
    month = source.month.id
  }

  if (!year && !month) {
    return null
  } else if (year && !month) {
    return [[year]]
  }

  return [[year, month]]
}

function validateOption(source, propName) {
  const prop = source[propName]
  return prop && 'id' in prop
}

function validatePeopleArray(source, propName) {
  const array = source[propName]
  return array && Array.isArray(array) && array.length > 0
}

function validateTextValue(prop) {
  if (prop && 'textValue' in prop && prop.textValue !== '') {
    return true
  }
  return false
}
