import { CitationDTO } from '../interfaces'
import { CACHE_CITATION, PROCESS_CITATION } from './constants'
import { formatCitation, toJsonCsl } from './lib'

export function processCitation(data: CitationDTO, hash: String) {
  return async (dispatch: Function) => {
    dispatch({
      type: PROCESS_CITATION,
      payload: { hash },
    })

    const csl = toJsonCsl(data.source)
    const citation = await formatCitation(csl, data.options)

    // cache citation
    dispatch({
      type: CACHE_CITATION,
      payload: {
        citation,
        hash,
      },
    })
  }
}
