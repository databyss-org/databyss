import { JSONSchema4 } from 'json-schema'

export const sourceSchema: JSONSchema4 = {
  title: 'Source',
  type: 'object',
  properties: {
    detail: {
      type: 'object',
      properties: {
        authors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              firstName: {
                $ref: 'text',
              },
              lastName: {
                $ref: 'text',
              },
            },
          },
        },
        publisher: {
          type: 'string',
        },
        editors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              firstName: {
                $ref: 'text',
              },
              lastName: {
                $ref: 'text',
              },
            },
          },
        },
        translators: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              firstName: {
                $ref: 'text',
              },
              lastName: {
                $ref: 'text',
              },
            },
          },
        },
        title: {
          $ref: 'text',
        },
        journalTitle: {
          $ref: 'text',
        },
        chapterTitle: {
          $ref: 'text',
        },
        issn: {
          $ref: 'text',
        },
        publisherName: {
          $ref: 'text',
        },
        publisherPlace: {
          $ref: 'text',
        },
        year: {
          $ref: 'text',
        },
        citations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: {
                $ref: 'text',
              },
              format: {
                type: 'string',
              },
            },
          },
        },
        volume: {
          $ref: 'text',
        },
        issue: {
          $ref: 'text',
        },
        yearPublished: {
          $ref: 'text',
        },
        page: {
          $ref: 'text',
        },
        isbn: {
          $ref: 'text',
        },
        doi: {
          $ref: 'text',
        },
        url: {
          $ref: 'text',
        },
        month: {
          type: 'object',
          properties: {
            id: {
              type: ['string', 'number'],
            },
            label: {
              type: 'string',
            },
          },
        },
        publicationType: {
          type: 'object',
          properties: {
            id: {
              type: ['string', 'number'],
            },
            label: {
              type: 'string',
            },
          },
        },
      },
    },
    name: {
      $ref: 'text',
    },
    title: {
      $ref: 'text',
    },
    media: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  // extend pouchdb types
  // block schema
  allOf: [{ $ref: 'pouchDb' }, { $ref: 'blockSchema' }],
}

export default sourceSchema
