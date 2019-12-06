export const slateValue = {
  object: 'block',
  type: 'ENTRY',
  key: '5d6442046e84d304ddceb768',
  data: {},
  nodes: [
    {
      object: 'text',
      text: 'The quick ',
      marks: [],
    },
    {
      object: 'text',
      text: 'brown ',
      marks: [
        {
          object: 'mark',
          type: 'bold',
          data: {},
        },
      ],
    },
    {
      object: 'text',
      text: 'fox jumps ',
      marks: [
        {
          object: 'mark',
          type: 'bold',
          data: {},
        },
        {
          object: 'mark',
          type: 'italic',
          data: {},
        },
      ],
    },
    {
      object: 'text',
      text: 'over ',
      marks: [
        {
          object: 'mark',
          type: 'italic',
          data: {},
        },
      ],
    },
    {
      object: 'text',
      text: 'the lazy dog.',
      marks: [],
    },
  ],
}

export const stateValue = {
  '5d6442046e84d304ddceb768': {
    _id: '5d6442046e84d304ddceb768',
    textValue: 'The quick brown fox jumps over the lazy dog.',
    ranges: [
      {
        offset: 10,
        length: 6,
        marks: ['bold'],
      },
      {
        offset: 16,
        length: 10,
        marks: ['bold', 'italic'],
      },
      {
        offset: 26,
        length: 5,
        marks: ['italic'],
      },
    ],
  },
}
