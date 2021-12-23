import { CitationStyles } from '../constants/CitationStyles'

export function getCitationStyle(styleId: string) {
  return CitationStyles.find((o) => o.id === styleId)
}
