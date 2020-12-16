import { defaultCitationStyle } from '../citations/constants'
import { httpDelete } from '../lib/requestApi'
import { Source, Author, SourceCitationHeader } from '../interfaces'

import * as pouchDb from '../database/sources'

import { CitationResponse } from '../database/sources/getSourceCitation'

// TODO: Add native versions of these

export const getSource = (_id: string): Promise<SourceCitationHeader> =>
  pouchDb.getSource(_id)

export const setSource = (data: Source) => pouchDb.setSource(data)

export const getSources = (): Promise<Source[]> => pouchDb.getSources()

export const getSourceCitations = (
  citationStyleId?: string
): Promise<CitationResponse[]> => {
  const styleId: string = citationStyleId || defaultCitationStyle?.id
  return pouchDb.getSourceCitation(styleId)
}

export const deleteSource = (_id: string) => httpDelete(`/sources/${_id}`)

export const getAuthors = (): Promise<Author[]> => pouchDb.getAuthors()

// dead link?
// export const getPageSources = (_id: string): Promise<Source[]> =>
//   httpGet(`/sources/pages/${_id}`)
