import { BlockType } from '@databyss-org/services/interfaces'
import { DbDocument } from './interfaces'

export const selectors = {
  BLOCKS: {
    doctype: 'BLOCK',
  },
  PAGES: {
    doctype: 'PAGE',
  },
  GROUPS: {
    doctype: 'GROUP',
  },
  SOURCES: {
    doctype: 'BLOCK',
    type: 'SOURCE',
  },
  SOURCE_RELATIONS: {
    doctype: 'BLOCK_RELATION',
    blockType: 'SOURCE',
  },
  EMBEDS: {
    doctype: 'BLOCK',
    type: 'EMBED',
  },
  EMBED_RELATIONS: {
    doctype: 'BLOCK_RELATION',
    blockType: 'EMBED',
  },
  TOPICS: {
    doctype: 'BLOCK',
    type: 'TOPIC',
  },
  TOPIC_RELATIONS: {
    doctype: 'BLOCK_RELATION',
    blockType: 'TOPIC',
  },
  LINK_RELATIONS: {
    doctype: 'BLOCK_RELATION',
    blockType: 'LINK',
  },
}

export const blockTypeToSelector = (blockType: BlockType) =>
  ({
    [BlockType.Embed]: selectors.EMBEDS,
    [BlockType.Source]: selectors.SOURCES,
    [BlockType.Topic]: selectors.TOPICS,
    [BlockType._ANY]: selectors.BLOCKS,
  }[blockType])

export const blockTypeToRelationSelector = (blockType: BlockType) =>
  ({
    [BlockType.Embed]: selectors.EMBED_RELATIONS,
    [BlockType.Topic]: selectors.TOPIC_RELATIONS,
    [BlockType.Source]: selectors.SOURCE_RELATIONS,
    [BlockType.Link]: selectors.LINK_RELATIONS,
  }[blockType])

/**
 * Given a document with a `doctype`, `blockType` and 'type` fields, returns all relevant selector keys
 */
export function getSelectorsForDoc(doc: DbDocument) {
  const _matched: string[] = []
  Object.keys(selectors).forEach((_key) => {
    const _selector = selectors[_key]
    if (doc.doctype === _selector.doctype) {
      if (
        // (!_selector.blockType && !_selector.type) ||
        (_selector.blockType && doc.blockType === _selector.blockType) ||
        (_selector.type && doc.type === _selector.type)
      ) {
        _matched.push(_key)
      }
    }
  })
  return _matched
}
