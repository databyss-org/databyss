import { defaultCitationStyle } from '../citations/constants'
import { httpGet, httpPost, httpDelete } from '../lib/requestApi'
import { Source, Author, SourceCitationHeader } from '../interfaces'
import getPouchSource from '../database/getSource'
import setPouchSource from '../database/setSource'
import getPouchSources from '../database/getSources'
import getPouchSourceCitation from '../database/getSourceCitation'
import { CitationResponse } from '../database/getSourceCitation'
import getPouchAuthors from '../database/getAuthors'

// TODO: Add native versions of these

export const getSource = (_id: string): Promise<SourceCitationHeader> =>
  getPouchSource(_id)

export const setSource = (data: Source) => setPouchSource(data)

export const getSources = (): Promise<Source[]> => getPouchSources()

// httpGet('/sources')

export const getSourceCitations = (
  citationStyleId?: string
): Promise<CitationResponse[]> => {
  const styleId: string = citationStyleId || defaultCitationStyle?.id
  return getPouchSourceCitation(styleId)
}

export const deleteSource = (_id: string) => httpDelete(`/sources/${_id}`)

export const getAuthors = (): Promise<Author[]> => getPouchAuthors()

// httpGet('/sources/authors')

export const getPageSources = (_id: string): Promise<Source[]> =>
  httpGet(`/sources/pages/${_id}`)
