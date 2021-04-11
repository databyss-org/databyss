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

const fs = require('fs')

const baseDir = process.env.NODE_ENV === 'production' ? '/app/build/api' : '.'
export const updateDesignDoc = async ({
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
    userPreferenceSchema,
    pointSchema,
    notificationSchema,
  }
  await db.upsert(_dd._id, () => _dd)
}

export const updateDesignDocs = async () => {
  const _designDatabaseTuple: [JSONSchema4, DocumentScope<DesignDoc>][] = [
    [userSchema, cloudant.models.UsersDesignDoc],
    [loginSchema, cloudant.models.LoginsDesignDoc],
    [sysGroupSchema, cloudant.models.GroupsDesignDoc],
  ]

  _designDatabaseTuple.forEach((t) =>
    updateDesignDoc({
      schema: t[0],
      db: t[1],
    })
  )
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
