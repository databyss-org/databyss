import { CitationStyles, DefaultCitationStyleId } from './CitationStyles'

export const CitationStyleOptions = CitationStyles.map((s) => ({
  id: s.id,
  label: s.shortName,
}))

export const defaultCitationStyle = CitationStyleOptions.find(
  (option) => option.id === DefaultCitationStyleId
)
