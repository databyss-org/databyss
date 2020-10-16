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

export function processCitation(
  data: CitationDTO,
  options?: CitationProcessOptions
) {
  return async (dispatch: Function) => {
    dispatch({
      type: PROCESS_CITATION,
      payload: { source: data.source, hash: options.hash },
    })

    try {
      const csl = toJsonCsl(data.source)
      const citation = await formatCitation(csl, data.options)
      dispatch({
        type: CACHE_CITATION,
        payload: {
          citation,
          hash: options.hash,
        },
      })
    } catch (error) {
      // Ignore error and do nothing.
      // This most likely occurs because citation library
      // is not being defensive enough internally.

      // TODO: show warning only if in dev mode?
      console.warn('Unable to process citation')
    }
  }
}
