import { Source } from './Block'

export interface BibliographyItem {
  citation: string
  source: Source
}

export interface BibliographyDict {
  [blockId: string]: BibliographyItem
}
