import { SourceDetail } from '../interfaces'
import { CACHE_CITATION, PROCESS_CITATION } from './constants/Actions'
import { CitationFormatOptions } from '.'
import { formatCitation } from './services/formatCitation'
import { toJsonCsl } from './services/toJsonCsl'

export interface CitationDTO {
  source: SourceDetail
  options: CitationFormatOptions
}

export interface CitationProcessOptions {
  hash: String
}

export function processCitation(data: CitationDTO, hash: String) {
  return async (dispatch: Function) => {
    console.info('--- actions.processCitation ---')
    dispatch({
      type: PROCESS_CITATION,
      payload: { hash },
    })

    const csl = toJsonCsl(data.source)
    const citation = await formatCitation(csl, data.options)

    // cache citation
    console.log('obtained citation, cache it')
    dispatch({
      type: CACHE_CITATION,
      payload: {
        citation,
        hash,
      },
    })
  }
}
