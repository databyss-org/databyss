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
