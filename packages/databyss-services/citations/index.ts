import { CitationFormatOptions, SourceDetail } from '../interfaces'
import { formatCitation, toJsonCsl } from './lib'

export async function toCitation(
  source: SourceDetail,
  options?: CitationFormatOptions
): Promise<any> {
  try {
    const csl = toJsonCsl(source)
    const citation = await formatCitation(csl, options)
    return citation
  } catch (err) {
    console.error('[Citation] error formatting citation', err)
    return '[citation unavailable]'
  }
}
