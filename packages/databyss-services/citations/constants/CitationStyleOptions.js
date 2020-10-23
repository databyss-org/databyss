import CitationStyleIds from './CitationStyleIds'
import CitationStyles from './CitationStyles'

const CitationStyleOptions = [
  {
    id: CitationStyleIds.APA,
    label: getShortNameFor(CitationStyleIds.APA),
  },
  {
    id: CitationStyleIds.CHICAGO,
    label: getShortNameFor(CitationStyleIds.CHICAGO),
  },
  {
    id: CitationStyleIds.HARVARD,
    label: getShortNameFor(CitationStyleIds.HARVARD),
  },
  {
    id: CitationStyleIds.IEEE,
    label: getShortNameFor(CitationStyleIds.IEEE),
  },
  {
    id: CitationStyleIds.MLA,
    label: getShortNameFor(CitationStyleIds.MLA),
  },
  {
    id: CitationStyleIds.VANCOUVER,
    label: getShortNameFor(CitationStyleIds.VANCOUVER),
  },
]

export const defaultCitationStyle = CitationStyleOptions[4]

function getShortNameFor(styleId) {
  return CitationStyles.find(style => style.id === styleId).shortName
}

export default CitationStyleOptions
