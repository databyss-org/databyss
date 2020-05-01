export default {
  preventDefault: false,
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
            marks: ['bold'],
          },
          {
            offset: 7,
            length: 10,
            marks: ['italic'],
          },
        ],
      },
    },
  },
  blockCache: {
    '5e48cdc1dbce857f65e4662d': {
      type: 'ENTRY',
      entityId: '5e3f829ce5447c0018baebed',
    },
  },
  blocks: [
    {
      _id: '5e48cdc1dbce857f65e4662d',
    },
  ],
}
