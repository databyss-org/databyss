import { sourceFromCatalogResult } from '../catalog/util'
import crossref from '../catalog/crossref'
import request from '../lib/request'

const PDF_API_URL = `${process.env.PDF_API_URL}/pdf/parse`
const CROSSREF_BASE_URL = 'https://api.crossref.org/works'
const PDF_TYPES = ['application/pdf']

export const fetchAnnotations = (file: File): Promise<any> => {
  const formData = new FormData()
  formData.append('pdf', file)

  return request(PDF_API_URL, {
    method: 'POST',
    body: formData,
    timeout: 30000,
    responseAsJson: false,
  })
}

export interface Metadata {
  author?: string
  title?: {
    src: string
    text: string
  }
}

export const fileIsPDF = (file: File) => PDF_TYPES.includes(file.type)

export const fetchMetadata = (data: Metadata): Promise<any> => {
  const { title, author } = data

  const queries: string[] = []
  if (title) {
    const t = title.text.replace(/ /g, '+')
    queries.push(`query.bibliographic=${t.toLowerCase()}`)
  }
  if (author) {
    const a = author.replace(/ /g, '+')
    queries.push(`query.author=${a.toLowerCase()}`)
  }
  // queries.push('select=title,author,DOI,ISSN')

  const url = `${CROSSREF_BASE_URL}?${queries.join('&')}`

  return request(url, { method: 'GET', timeout: 30000, responseAsJson: true })
}

export const findMatchesInCrossref = (crossref, metadata: Metadata) => {
  const { title } = metadata
  const matches: any[] = []
  crossref.message.items.forEach((element) => {
    if (element.title && Array.isArray(element.title)) {
      const elementTitle = element.title[0]
      if (elementTitle === title?.src || elementTitle === title?.text) {
        matches.push(element)
      }
    }
  })
  return matches
}

export const queryMetadataFromCatalog = async (metadata: Metadata) => {
  // get additional metadata from crossref
  const crossrefResponse = await fetchMetadata(metadata)

  // find in crossref the item(s) that match the title in metadata.fromPDF
  const matches = findMatchesInCrossref(crossrefResponse, metadata)

  // select first match
  if (matches.length > 0) {
    if (matches.length > 1) {
      // TODO: show modal to select if more than one match?
      console.warn(
        'More than one item provided by Crossref matched the PDF. Using first one found.'
      )
    }
    return sourceFromCatalogResult({
      result: matches[0],
      service: crossref,
    })
  }
  return null
}
