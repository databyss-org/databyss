import { CitationStyleOptions } from '../constants'

export function getCitationStyleOption(styleId: string) {
  return CitationStyleOptions.find((o) => o.id === styleId)
}
