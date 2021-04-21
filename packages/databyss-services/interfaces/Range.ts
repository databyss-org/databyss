export interface Range {
  offset: number
  length: number
  marks: Array<RangeType | InlineRangeType>
}

export enum InlineTypes {
  InlineTopic = 'inlineTopic',
}

export type InlineRangeType = [InlineTypes, string]
// INLINE REFACTOR

export enum RangeType {
  Bold = 'bold',
  Italic = 'italic',
  Location = 'location',
  Highlight = 'highlight',
  InlineAtomicInput = 'inlineAtomicMenu',
}
