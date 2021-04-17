import * as pouchDb from '@databyss-org/data/pouchdb/sources'
import { CitationResponse } from '@databyss-org/data/pouchdb/sources/lib/getSourceCitation'
import { defaultCitationStyle } from '../citations/constants'
import { httpDelete } from '../lib/requestApi'
import { Source, Author, SourceCitationHeader } from '../interfaces'

import { ResourceNotFoundError } from '../interfaces/Errors'

// TODO: Add native versions of these

export const getSource = (
  _id: string
): Promise<SourceCitationHeader | ResourceNotFoundError> =>
  pouchDb.getSource(_id)

export const setSource = (data: Source) => pouchDb.setSource(data)

export const getSources = (): Promise<Source[] | ResourceNotFoundError> =>
  pouchDb.getSources()

export const getSourceCitations = (
  citationStyleId?: string
): Promise<CitationResponse[] | ResourceNotFoundError> => {
  const styleId = citationStyleId || defaultCitationStyle?.id
  return pouchDb.getSourceCitation(styleId)
}

export const deleteSource = (_id: string) => httpDelete(`/sources/${_id}`)

export const getAuthors = (): Promise<Author[] | ResourceNotFoundError> =>
  pouchDb.getAuthors()

// dead link?
// export const getPageSources = (_id: string): Promise<Source[]> =>
//   httpGet(`/sources/pages/${_id}`)
