import { SourceDetail } from '../interfaces'

import { formatCitation } from './services/formatCitation'
import { toJsonCsl } from './services/toJsonCsl'

export interface CitationFormatOptions {
  styleId?: string
  outputType?: string
}

export async function toCitation(
  source: SourceDetail,
  options?: CitationFormatOptions
): Promise<any> {
  const csl = toJsonCsl(source)
  return formatCitation(csl, options)
}
