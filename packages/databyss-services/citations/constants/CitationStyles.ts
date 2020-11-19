import StylesDetails from './citation-styles.json'

export enum StyleTypeShortName {
  AMA = 'AMA',
  APA = 'APA',
  Chicago = 'Chicago',
  Harvard = 'Hardvard',
  IEEE = 'IEEE',
  MLA = 'MLA',
  Vancouver = 'Vancouver',
}

export enum StyleTypeId {
  AMA = 'american-medical-association',
  APA = 'American Psychological Association 7th edition',
  Chicago = 'chicago',
  Harvard = 'harvard1',
  IEEE = 'ieee',
  MLA = 'mla',
  Vancouver = 'vancouver',
}

export interface CitationStyle {
  id: StyleTypeId | string
  name: string
  shortName: string
  url: string
}

export interface IStyleDetails {
  defaultStyleId: string
  styles: CitationStyle[]
}

export const CitationStyles: CitationStyle[] = StylesDetails.styles
export const DefaultCitationStyleId: string = StylesDetails.defaultStyleId
