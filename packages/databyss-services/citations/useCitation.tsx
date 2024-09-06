import { useQuery } from '@tanstack/react-query'
import { CitationFormatOptions, SourceDetail } from '../interfaces'
import { generateHash } from './lib/generateHash'
import { formatCitation, pruneCitation, toJsonCsl } from './lib'

export const useCitation = (
  source: SourceDetail,
  options: CitationFormatOptions
) =>
  useQuery({
    queryKey: [generateHash(source, options)],
    queryFn: async () => {
      const csl = toJsonCsl(source)
      const citation = await formatCitation(csl, options)
      return options.styleId
        ? pruneCitation(citation, options.styleId)
        : citation
    },
  })
