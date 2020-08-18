import { Block } from '../interfaces'

export const prefixSearch = (query: string) => (block: Block) =>
  block.text.textValue.match(new RegExp(`\\b${query}`, 'i'))
