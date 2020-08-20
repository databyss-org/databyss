import { httpGet, httpPost, httpDelete } from '../lib/requestApi'
import { Source, Author, SourceCitationHeader } from '../interfaces'

// TODO: Add native versions of these

export const getSource = (_id: string): Promise<Source> =>
  httpGet(`/sources/${_id}`)

export const setSource = (data: Source) => httpPost('/sources', { data })

export const getSources = (): Promise<Source[]> => httpGet('/sources')

export const getSourceCitations = (): Promise<SourceCitationHeader[]> =>
  httpGet('/sources/citations')

export const deleteSource = (_id: string) => httpDelete(`/sources/${_id}`)

export const getAuthors = (): Promise<Author[]> => httpGet('/sources/authors')

export const getPageSources = (_id: string): Promise<Source[]> =>
  httpGet(`/sources/pages/${_id}`)
