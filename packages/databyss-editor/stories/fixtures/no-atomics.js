export default {
  preventDefault: false,
  showMenuActions: false,
  showFormatMenu: false,
  showNewBlockMenu: true,
  operations: [],
  selection: {
    anchor: {
      index: 0,
      offset: 0,
    },
    focus: {
      index: 0,
      offset: 0,
    },
  },
  newEntities: [], // renamed from `newAtomics`
  changedEntities: [],
  entityCache: {
    '5e3f829ce5447c0018baebed': {
      type: 'ENTRY',
      _id: '5e3f829ce5447c0018baebed',
      text: {
        textValue: `On the limitation of \nthird-order thought to assertion`,
        ranges: [
          {
            offset: 7,
            length: 10,
            mark: 'bold',
          },
        ],
      },
    },
    '5e482019a22c0a42ee20a748': {
      type: 'ENTRY',
      _id: '5e482019a22c0a42ee20a748',
      text: {
        textValue: 'Another entry',
        ranges: [],
      },
    },
    '5e3f829ce5447c0018baebee': {
      type: 'ENTRY',
      _id: '5e3f829ce5447c0018baebed',
      text: {
        textValue: '',
        ranges: [],
      },
    },
  },
  blockCache: {
    '5e48cdc1dbce857f65e4662d': {
      type: 'ENTRY',
      entityId: '5e3f829ce5447c0018baebed',
    },
    '5e36ff96b21e9400186c3126': {
      type: 'ENTRY',
      entityId: '5e3f829ce5447c0018baebee',
    },
    '5e481ff8a22c0a42ee20a667': {
      type: 'ENTRY',
      entityId: '5e482019a22c0a42ee20a748',
    },
  },
  blocks: [
    {
      _id: '5e48cdc1dbce857f65e4662d',
    },
    {
      _id: '5e481ff8a22c0a42ee20a667',
    },
    {
      _id: '5e36ff96b21e9400186c3126',
    },
  ],
}
