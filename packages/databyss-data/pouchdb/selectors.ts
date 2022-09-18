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
