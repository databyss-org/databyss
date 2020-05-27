import ObjectId from 'bson-objectid'

export const withWhitelist = patch =>
  patch.filter(
    p =>
      // blacklist if operation array includes `__`
      !(
        p.path
          .map(k => typeof k === 'string' && k.includes('__'))
          .filter(Boolean).length ||
        // blacklist if it includes sleciton or operation
        //   p.path.includes('selection') ||
        p.path.includes('operations') ||
        p.path.includes('preventDefault')
      )
  )

export const addMetaData = ({ state, patch, count }) => {
  // TODO: REMOVE COUNT

  let _patch = withWhitelist(patch)
  // add type to 'entityCache' to operation 'replace'
  _patch = _patch.map(p => {
    let _p = p
    // add selection

    if (_p.path[0] === 'selection') {
      _p = { ..._p, value: { ..._p.value, _id: state.selection._id }, count }
    }

    if (p.path[0] !== 'entityCache' || p.op !== 'replace') {
      return _p
    }

    // look up in state
    const _id = _p.path[1]
    const _type = state.entityCache[_id].type
    return { ..._p, value: { ..._p.value, type: _type }, count }
  })

  return { state, patch: _patch }
}

export const newPage = () => {
  const _refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()

  const _page = {
    preventDefault: false,
    operations: [],
    selection: {
      _id: ObjectId().toHexString(),
      anchor: {
        index: 0,
        offset: 0,
      },
      focus: {
        index: 0,
        offset: 0,
      },
    },
    newEntities: [],
    entityCache: {
      [_refId]: {
        type: 'ENTRY',
        _id: _refId,
        text: {
          textValue: '',
          ranges: [],
        },
      },
    },
    blockCache: {
      [_id]: {
        type: 'ENTRY',
        entityId: _refId,
      },
    },
    blocks: [
      {
        _id,
      },
    ],
    page: {
      _id: ObjectId().toHexString(),
      name: 'untitled',
    },
  }
  return _page
}
