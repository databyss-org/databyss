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

export const isTextAtomic = text => {
  if (text.length < 1) {
    return false
  }
  const _firstCharacter = text.split('')[0]
  const types = symbol => ({ '@': 'SOURCE', '#': 'TOPIC' }[symbol])
  if (types(_firstCharacter)) {
    return true
  }
  return false
}

export const isTextAtomicAtIndex = (state, index) => {
  const _text =
    state.entityCache[state.blockCache[state.blocks[index]._id].entityId].text
      .textValue

  if (isTextAtomic(_text)) {
    const _firstCharacter = _text.split('')[0]
    const types = symbol => ({ '@': 'SOURCE', '#': 'TOPIC' }[symbol])
    const _data = {
      text: {
        textValue: _text.substring(1),
        // TODO: GET RANGES
        ranges: [],
      },
      type: types(_firstCharacter),
      _id: state.blockCache[state.blocks[index]._id].entityId,
    }

    return _data
  }
  return false
}
