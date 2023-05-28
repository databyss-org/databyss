import {
  Block,
  BlockRelation,
  Page,
  Source,
  Topic,
} from '@databyss-org/services/interfaces'
import equal from 'fast-deep-equal'

export function docsEqual(docA: any, docB: any) {
  if (typeof docA !== typeof docB) {
    return false
  }
  if (docA.doctype !== docB.doctype) {
    console.error('[docsEqual doctypes do not match', docA, docB)
    throw new Error('[docsEqual] doctype must match')
  }
  if (docA.doctype === 'BLOCK') {
    if (docA.type !== docB.type) {
      throw new Error('[docsEqual] block type must match')
    }
    if (docA.type === 'SOURCE') {
      return sourcesEqual(docA as Source, docB as Source)
    }
    return blocksEqual(docA as Block, docB as Block)
  }
  return equal(docA, docB)
}

export function blocksEqual(blockA: Block, blockB: Block) {
  console.log('[blocksEqual]', blockA.text, blockB.text)
  return equal(blockA.text, blockB.text)
}

export function sourcesEqual(sourceA: Source, sourceB: Source) {
  return (
    blocksEqual(sourceA, sourceB) &&
    (!sourceA.name || !sourceB.name || equal(sourceA.name, sourceB.name))
  )
}

export function topicsEqual(topicA: Topic, topicB: Topic) {
  return blocksEqual(topicA, topicB)
}

export function pagesEqual(pageA: Page, pageB: Page) {
  return equal(pageA, pageB)
}

export function blockRelationEqual(
  relationA: BlockRelation,
  relationB: BlockRelation
) {
  return equal(relationA, relationB)
}
