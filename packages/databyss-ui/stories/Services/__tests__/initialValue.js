import { uid } from '@databyss-org/data/lib/uid'

export const _id1 = uid()
export const _id2 = uid()

export const _seedValue1 = {
  authors: [
    {
      firstName: { textValue: 'Max' },
      lastName: { textValue: 'Stamenov' },
    },
  ],

  text: {
    textValue: 'Stamenov. Language Structure',
    ranges: [{ offset: 0, length: 2, marks: 'bold' }],
  },
  citations: [
    {
      textValue:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company, 1997. Crossref, doi:10.1075/aicr.12.',
      ranges: [{ length: 10, offset: 0, marks: ['bold'] }],
    },
  ],
  _id: _id1,
}

export const _seedValue2 = {
  authors: [
    {
      firstName: { textValue: 'Max' },
      lastName: { textValue: 'Stamenov' },
    },
  ],
  text: {
    textValue: 'Second',
    ranges: [{ offset: 0, length: 2, marks: 'bold' }],
  },
  citations: [
    {
      textValue: 'Second Source',
      ranges: [],
    },
  ],
  _id: _id2,
}
