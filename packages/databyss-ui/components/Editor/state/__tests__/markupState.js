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
    text: 'The quick brown fox jumps over the lazy dog.',
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

// export const slateValue = {
//   object: 'document',
//   data: {},
//   nodes: [
//     {
//       object: 'block',
//       type: 'ENTRY',
//       data: {},
//       nodes: [
//         {
//           object: 'text',
//           text: 'this text is ',
//           marks: [],
//         },
//         {
//           object: 'text',
//           text: 'bold ',
//           marks: [
//             {
//               object: 'mark',
//               type: 'bold',
//               data: {},
//             },
//           ],
//         },
//         {
//           object: 'text',
//           text: 'bold-italic ',
//           marks: [
//             {
//               object: 'mark',
//               type: 'bold',
//               data: {},
//             },
//             {
//               object: 'mark',
//               type: 'italic',
//               data: {},
//             },
//           ],
//         },
//         {
//           object: 'text',
//           text: 'italic ',
//           marks: [
//             {
//               object: 'mark',
//               type: 'italic',
//               data: {},
//             },
//           ],
//         },
//         {
//           object: 'text',
//           text: 'normal',
//           marks: [],
//         },
//       ],
//     },
//   ],
// }

// export const stateValue = {
//   activeBlockId: '5d64424bcfa313f70483c1b0',
//   page: {
//     blocks: [{ _id: '5d64424bcfa313f70483c1b0', value: {

//     } }],
//     name: 'pauls document',
//     _id: '5d6443bdd9ca9149d1a346c2',
//   },
//   entries: {
//     '5d7bef47184fba65241a4a54': {
//       rawHtml: 'this text is \*bold\* _*bold-italic*_ _italic_ normal this is a star: \*',
//       _id: '5d7bef47184fba65241a4a54',
//     },
//   },
//   blocks: {
//     '5d64424bcfa313f70483c1b0': {
//       refId: '5d7bef47184fba65241a4a54',
//       type: 'ENTRY',
//       _id: '5d64424bcfa313f70483c1b0',
//     },
//   },
// }
