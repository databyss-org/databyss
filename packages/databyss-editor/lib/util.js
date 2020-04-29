import _ from 'lodash'

export const splice = (src, idx, rem, str) =>
  src.slice(0, idx) + str + src.slice(idx + Math.abs(rem))

export const isAtomicInlineType = type => {
  switch (type) {
    case 'SOURCE':
      return true
    case 'TOPIC':
      return true
    default:
      return false
  }
}

export const getEntityAtIndex = (state, index) => {
  const entity =
    state.entityCache[state.blockCache[state.blocks[index]._id].entityId]
  return {
    ...entity,
    isAtomic: isAtomicInlineType(entity.type),
    isEmpty: entity.text.textValue.length === 0,
  }
}

// returns an array of indicies covered by selection
export const getSelectedIndicies = selection =>
  _.range(selection.anchor.index, selection.focus.index + 1)

export const withMetaData = state => {
  return {
    ...state,
    newEntities: [],
    operations: [],
  }
}
