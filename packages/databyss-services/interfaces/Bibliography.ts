import { Source } from './Block'

export interface BibliographyItem {
  citationStyle?: string
  citation: string
  source: Source
}

export interface BibliographyDict {
  [blockId: string]: BibliographyItem
}
