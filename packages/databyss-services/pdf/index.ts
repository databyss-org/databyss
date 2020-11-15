import request from '../lib/request'

const PDF_API_URL = `${process.env.PDF_API_URL}/pdf/parse`
const CROSSREF_BASE_URL = 'https://api.crossref.org/works'

export const fetchAnnotations = (file: File): Promise<any> => {
  const formData = new FormData()
  formData.append('pdf', file)

  return request(
    PDF_API_URL,
    {
      method: 'POST',
      body: formData,
      timeout: 30000,
    },
    false
  )
}

export interface Metadata {
  author?: string
  title?: {
    src: string
    text: string
  }
}

export const fetchMetadata = (data: Metadata): Promise<any> => {
  const { title, author } = data

  const queries = []
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

  return request(url, { method: 'GET', timeout: 30000 }, true)
}
