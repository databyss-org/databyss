import { CitationStyleIds } from './CitationStyleIds'

const zoteroBaseUrl = 'https://www.zotero.org/styles'

export const CitationStyles = [
  {
    id: CitationStyleIds.APA,
    name: 'American Psychological Association 7th edition',
    shortName: 'APA',
    url: `${zoteroBaseUrl}/apa`,
  },
  {
    id: CitationStyleIds.CHICAGO,
    name: 'Chicago Manual of Style 17th edition (full note)',
    shortName: 'Chicago',
    url: `${zoteroBaseUrl}/chicago-fullnote-bibliography`,
  },
  {
    id: CitationStyleIds.HARVARD,
    name: 'Harvard Reference Format 1',
    shortName: 'Harvard',
    url: `${zoteroBaseUrl}/harvard1`,
  },
  {
    id: CitationStyleIds.IEEE,
    name: 'IEEE',
    shortName: 'IEEE',
    url: `${zoteroBaseUrl}/ieee`,
  },
  {
    id: CitationStyleIds.MLA,
    name: 'Modern Language Association 8th edition',
    shortName: 'MLA',
    url: `${zoteroBaseUrl}/modern-language-association`,
  },
  {
    id: CitationStyleIds.VANCOUVER,
    name: 'Vancouver',
    shortName: 'Vancouver',
    url: `${zoteroBaseUrl}/vancouver`,
  },
]
