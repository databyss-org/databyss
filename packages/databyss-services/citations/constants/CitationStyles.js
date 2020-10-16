import CitationStyleIds from './CitationStyleIds'

const zoteroBaseUrl = 'https://www.zotero.org/styles'

const CitationStyles = [
  {
    id: CitationStyleIds.APA,
    name: 'American Psychological Association',
    shortName: 'APA',
    url: `${zoteroBaseUrl}/apa`,
  },
  {
    id: CitationStyleIds.CHICAGO,
    name: 'Chicago Manual of Style',
    shortName: 'Chicago',
    url: `${zoteroBaseUrl}/chicago-fullnote-bibliography`,
  },
  {
    id: CitationStyleIds.IEEE,
    name: 'IEEE',
    shortName: 'IEEE',
    url: `${zoteroBaseUrl}/ieee`,
  },
  {
    id: CitationStyleIds.MLA,
    name: 'Modern Language Association',
    shortName: 'MLA',
    url: `${zoteroBaseUrl}/mla`,
    data: require('../assets/modern-language-association.csl'),
  },
  {
    id: CitationStyleIds.VANCOUVER,
    name: 'Vancouver',
    shortName: 'Vancouver',
    url: `${zoteroBaseUrl}/vancouver`,
  },
]

export default CitationStyles
