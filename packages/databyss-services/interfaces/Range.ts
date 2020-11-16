export interface Range {
  offset: number
  length: number
  marks: Array<RangeType | InlineRangeType>
}

export enum InlineTypes {
  InlineTopic = 'inlineTopic',
}

export type InlineRangeType = [InlineTypes, string]

export enum RangeType {
  Bold = 'bold',
  Italic = 'italic',
  Location = 'location',
  InlineAtomicInput = 'inlineAtomicMenu',
}
