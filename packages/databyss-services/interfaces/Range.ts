export type Mark = RangeType | InlineRangeType

export interface Range {
  offset: number
  length: number
  marks: Mark[]
}

export enum InlineTypes {
  InlineTopic = 'inlineTopic',
  InlineSource = 'inlineCitation',
  Embed = 'embed',
  Link = 'link',
}

export type InlineRangeType = [InlineTypes, string]

export enum RangeType {
  Bold = 'bold',
  Italic = 'italic',
  Location = 'location',
  Highlight = 'highlight',
  InlineAtomicInput = 'inlineAtomicMenu',
  InlineEmbedInput = 'inlineEmbedInput',
  InlineLinkInput = 'inlineLinkInput',
}
