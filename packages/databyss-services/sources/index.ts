import { httpGet, httpPost, httpDelete } from '../lib/requestApi'
import request from '../lib/request'
import { Source, Author, SourceCitations } from '../interfaces'

// TODO: Add native versions of these

export const getSource = (_id: string): Promise<Source> =>
  httpGet(`/sources/${_id}`)

export const setSource = (data: Source) => httpPost('/sources', { data })

export const getSources = (): Promise<Source[]> => httpGet('/sources')

export const getSourceCitations = (): Promise<SourceCitations[]> =>
  httpGet('/sources/citations')

export const deleteSource = (_id: string) => httpDelete(`/sources/${_id}`)

export const getAuthors = (): Promise<Author[]> => httpGet('/sources/authors')

export const getPageSources = (_id: string): Promise<Source[]> =>
  httpGet(`/sources/pages/${_id}`)

export const searchSource = (query: string) =>
  request(
    `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyCCoJxl3VhVwvM4v4cHSPJY6hsK-kh5VBk`
  )
