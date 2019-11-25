import ObjectId from 'bson-objectid'

export const _id1 = ObjectId().toHexString()
export const _id2 = ObjectId().toHexString()

export const _seedValue1 = {
  authors: [
    {
      firstName: 'Max',
      lastName: 'Stamenov',
    },
  ],
  name: 'Stamenov. Language Structure',
  ranges: [{ offset: 0, length: 2, marks: 'bold' }],
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
      firstName: 'Max',
      lastName: 'Stamenov',
    },
  ],
  name: 'Second',
  ranges: [{ offset: 0, length: 2, marks: 'bold' }],
  citations: [
    {
      textValue: 'Second Source',
      ranges: [],
    },
  ],
  _id: _id2,
}
