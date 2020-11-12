import { SourceDetail } from './Block'

export interface CitationFormatOptions {
  styleId?: string
  outputType?: string
}

export interface CitationDTO {
  source: SourceDetail
  options: CitationFormatOptions
}

export interface CitationProcessOptions {
  hash: String
}
