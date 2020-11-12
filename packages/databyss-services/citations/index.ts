import { CitationFormatOptions, SourceDetail } from '../interfaces'
import { formatCitation, toJsonCsl } from './lib'

export async function toCitation(
  source: SourceDetail,
  options?: CitationFormatOptions
): Promise<any> {
  const csl = toJsonCsl(source)
  return formatCitation(csl, options)
}
