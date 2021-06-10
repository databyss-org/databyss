export interface Range {
  offset: number
  length: number
  marks: Array<RangeType | InlineRangeType>
}

export enum InlineTypes {
  InlineTopic = 'inlineTopic',
  InlineSource = 'inlineCitation',
  Embed = 'embed',
}

export type InlineRangeType = [InlineTypes, string]

export enum RangeType {
  Bold = 'bold',
  Italic = 'italic',
  Location = 'location',
  Highlight = 'highlight',
  InlineAtomicInput = 'inlineAtomicMenu',
  InlineEmbedInput = 'inlineEmbedInput',
}
