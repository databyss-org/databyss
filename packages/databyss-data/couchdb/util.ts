import {
  userSchema,
  loginSchema,
  sysGroupSchema,
  sourceSchema,
  blockRelationSchema,
  selectionSchema,
  pageSchema,
  groupSchema,
  entrySchema,
  topicSchema,
  textSchema,
  pouchDocSchema,
  blockSchema,
  userPreferenceSchema,
  pointSchema,
  notificationSchema,
} from '@databyss-org/data/schemas'
import { DocumentScope } from 'nano'
import { DesignDoc } from '@databyss-org/data/interfaces'
import { JSONSchema4 } from 'json-schema'
import path from 'path'
import { cloudant } from './cloudant'
// import { UserPreference } from '../pouchdb/interfaces'
// import { upsert } from '../pouchdb/utils'
import embedSchema from '../schemas/embedSchema'

const fs = require('fs')

const baseDir = process.env.NODE_ENV === 'production' ? '/app/build/api' : '.'

export const updateValidationDesignDoc = async ({
  schema,
  db,
}: {
  db: DocumentScope<DesignDoc>
  schema?: JSONSchema4
}) => {
  const _dd: DesignDoc = {
    _id: '_design/schema_validation',
    validate_doc_update: fs
      .readFileSync(
        path.join(
          __dirname,
          `${baseDir}/_design_doc_includes/validate_doc_update.js.es5`
        )
      )
      .toString(),
    libs: {
      tv4: fs
        .readFileSync(
          path.join(__dirname, `${baseDir}/_design_doc_includes/tv4.js.es5`)
        )
        .toString(),
    },
    schema,
    pouchDocSchema,
    blockSchema,
    sourceSchema,
    textSchema,
    blockRelationSchema,
    selectionSchema,
    pageSchema,
    groupSchema,
    entrySchema,
    topicSchema,
    embedSchema,
    userPreferenceSchema,
    pointSchema,
    notificationSchema,
  }
  await db.upsert(_dd._id, () => _dd)
}

export const updateIndexDesignDocs = async (db: DocumentScope<any>) => {
  const _dd = {
    _id: '_design/fulltext_search_index',
    language: 'query',
    indexes: {
      fulltext_search_index: {
        index: {
          default_analyzer: 'english',
          default_field: {},
          partial_filter_selector: {},
          selector: {},
          fields: [
            {
              type: 'string',
              name: 'text.textValue',
            },
          ],
          index_array_lengths: true,
        },
        analyzer: {
          name: 'perfield',
          default: 'english',
          fields: {
            $default: 'english',
          },
        },
      },
    },
  }
  await db.upsert(_dd._id, () => _dd)
}

export const updateCustomIndexDesignDocs = async (db: DocumentScope<any>) => {
  const _dd = {
    _id: '_design/custom_search_index',
    language: 'javascript',
    indexes: {
      fulltext: {
        analyzer: {
          name: 'perfield',
          default: 'english',
          fields: {
            $default: 'english',
          },
        },
        index:
          "function (doc) { if (doc.text && doc.text.textValue) { index('text', doc.text.textValue, { store: true }) } }",
      },
    },
  }
  await db.upsert(_dd._id, () => _dd)
}

export const updateGroupDesignDocs = async (db: DocumentScope<any>) => {
  await updateValidationDesignDoc({ db })
  await updateIndexDesignDocs(db)
}

export const updateSysDesignDocs = async () => {
  const _designDatabaseTuples: [JSONSchema4, DocumentScope<DesignDoc>][] = [
    [userSchema, cloudant.models.UsersDesignDoc],
    [loginSchema, cloudant.models.LoginsDesignDoc],
    [sysGroupSchema, cloudant.models.GroupsDesignDoc],
  ]

  for (const t of _designDatabaseTuples) {
    await updateValidationDesignDoc({
      schema: t[0],
      db: t[1],
    })
  }
}

export const initiateDatabases = async () => {
  // initialize databases if not yet created
  for (const d of ['groups', 'logins', 'users']) {
    try {
      await cloudant.current.db.get(d)
    } catch (err) {
      await cloudant.current.db.create(d)
    }
  }
  // update index
  for (const d of ['groups', 'logins', 'users']) {
    const _db = await cloudant.current.use(d)
    const _id = { name: '_id', type: 'json', index: { fields: ['_id'] } }
    _db.index(_id)
  }

  // add email index to users
  const _user = await cloudant.current.use('users')
  const _id = { name: 'email', type: 'json', index: { fields: ['email'] } }
  _user.index(_id)
}
