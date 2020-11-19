import { kebabCase } from 'lodash'

import { CROSSREF, GOOGLE_BOOKS, OPEN_LIBRARY } from '../../catalog/constants'

import { PublicationTypeId } from '../constants/PublicationTypeId'
import { CatalogType } from '../../interfaces/CatalogState'

const allTypes = Object.values(PublicationTypeId)

const crossRefTypesMap: { [key: string]: string } = {}
allTypes.forEach((type) => {
  crossRefTypesMap[kebabCase(type)] = type
})

export function normalizePublicationId(value: string, source: CatalogType) {
  // error checks
  if (!value) {
    throw new Error(
      'normalizePublicationId() expected `value` as first parameter.'
    )
  }
  if (typeof value !== 'string') {
    throw new Error(
      'normalizePublicationId() expected the `value` parameter to be a string.'
    )
  }
  if (!source) {
    throw new Error(
      'normalizePublicationId() expected `source` as second parameter.'
    )
  }
  const supportedSources = [CROSSREF, GOOGLE_BOOKS, OPEN_LIBRARY]
  const unsupportedValueMessage =
    'normalizePublicationId() was provided an unsupported value for `source`: ' +
    `"${source}". ` +
    'Currently supported values are ' +
    `"${GOOGLE_BOOKS}", ` +
    `"${CROSSREF}", ` +
    `and "${OPEN_LIBRARY}".`
  if (supportedSources.indexOf(source) === -1) {
    throw new Error(unsupportedValueMessage)
  }

  switch (source) {
    case CatalogType.Crossref:
      return normalizeFromCrossRef(value)
    case CatalogType.GoogleBooks:
      return normalizeFromGoogleBooks(value)
    case CatalogType.OpenLibrary:
      return normalizeFromOpenLibrary()
    default:
      // somehow got passed the check above?
      // this also satisfies the linter
      console.warn(unsupportedValueMessage)
      return value
  }
}

// utils
function normalizeFromCrossRef(value: string) {
  // specific cases handling
  if (value.toLowerCase() === 'book-chapter') {
    return PublicationTypeId.BOOK_SECTION
  }
  // if (value.toLowerCase() === 'reference-entry') {
  // TODO: handle "reference-entry"
  // return ???
  // }

  const response = crossRefTypesMap[value]
  if (response) {
    return response
  }

  console.warn(`Unhandled CrossRef publication type: "${value}".`)
  return null
}

function normalizeFromGoogleBooks(value: string) {
  // books#bookshelves
  // books#bookshelf
  // books#volumes
  // books#volume

  if (value === 'books#volume') {
    return PublicationTypeId.BOOK
  }

  console.warn(`Unhandled Google Book publication type: "${value}".`)
  return null
}

function normalizeFromOpenLibrary() {
  // this service consistantly returns "work"
  // parse differently if something else is needed
  return PublicationTypeId.BOOK
}
