import ObjectId from 'bson-objectid'

const _id = ObjectId().toHexString()

export const emptySource = {
  authors: [
    {
      firstName: {
        textValue: '',
      },
      lastName: {
        textValue: '',
      },
    },
  ],
  text: {
    textValue: '',
    ranges: [],
  },
  citations: [
    {
      textValue: '',
      ranges: [],
    },
  ],
  _id,
}

export const populatedSource = {
  authors: [
    {
      firstName: {
        textValue: 'Maxim',
      },
      lastName: {
        textValue: 'Stamenov',
      },
    },
  ],
  text: {
    textValue: 'Stamenov, Language Structure',
    ranges: [
      {
        offset: 10,
        length: 18,
        marks: ['italic'],
      },
    ],
  },
  citations: [
    {
      textValue:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company, 1997. Crossref, doi:10.1075/aicr.12.',
      ranges: [],
    },
  ],
  _id,
}
