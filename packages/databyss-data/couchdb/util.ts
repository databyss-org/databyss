import {
  LoginsDesignDoc,
  GroupsDesignDoc,
  UsersDesignDoc,
} from '@databyss-org/data/couchdb'
import {
  userSchema,
  loginSchema,
  groupSchema,
  sourceSchema,
  blockRelationSchema,
  selectionSchema,
  pageSchema,
  entrySchema,
  topicSchema,
  textSchema,
  pouchDocSchema,
  blockSchema,
} from '@databyss-org/data/schemas'
import { DocumentScope } from 'nano'
import { DesignDoc } from '@databyss-org/data/interfaces'
import { JSONSchema4 } from 'json-schema'
import path from 'path'
import { cloudant } from './cloudant'

const fs = require('fs')

<<<<<<< HEAD
export const updateDesignDoc = async ({
=======
// export const updateClientDesignDoc = async (db: DocumentScope<DesignDoc>) => {
//   const _dd: DesignDoc = {
//     // if you want to debug this, debug on the client side using pouchDB transform plugin
//     _id: '_design/schema_validation',
//     validate_doc_update: fs
//       .readFileSync(
//         path.join(
//           __dirname,
//           './_design_doc_includes/validate_client_doc_update.js.es5'
//         )
//       )
//       .toString(),
//     libs: {
//       tv4: fs
//         .readFileSync(path.join(__dirname, './_design_doc_includes/tv4.js.es5'))
//         .toString(),
//     },
//     // TODO: this should be a map function iterating over all the schemas
//     sourceSchema,
//     textSchema,
//   }

//   await db.upsert(_dd._id, () => _dd)
//   console.log('AFTER UPSERT OF DESIGN DOCUMENT')
// }

const baseDir = process.env.NODE_ENV === 'production' ? '/app/build/api' : '.'

const updateDesignDoc = async ({
>>>>>>> ed539277d8f0d9f3d3d716be3298cfcd24deb54e
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
          './_design_doc_includes/validate_doc_update.js.es5'
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
    entrySchema,
    topicSchema,
  }
  await db.upsert(_dd._id, () => _dd)
}

export const updateDesignDocs = async () => {
  const _designDatabaseTuple: [JSONSchema4, DocumentScope<DesignDoc>][] = [
    [userSchema, UsersDesignDoc],
    [loginSchema, LoginsDesignDoc],
    [groupSchema, GroupsDesignDoc],
  ]

  _designDatabaseTuple.forEach((t) =>
    updateDesignDoc({
      schema: t[0],
      db: t[1],
<<<<<<< HEAD
=======
      script: `${baseDir}/_design_doc_includes/validate_doc_update.js.es5`,
>>>>>>> ed539277d8f0d9f3d3d716be3298cfcd24deb54e
    })
  )
}

export const initiateDatabases = async () => {
  // initialize databases if not yet created
  for (const d of ['groups', 'logins', 'users']) {
    try {
      await cloudant.db.get(d)
    } catch (err) {
      await cloudant.db.create(d)
    }
  }
  // update index
  for (const d of ['groups', 'logins', 'users']) {
    const _db = await cloudant.use(d)
    const _id = { name: '_id', type: 'json', index: { fields: ['_id'] } }
    _db.index(_id)
  }

  // add email index to users
  const _user = await cloudant.use('users')
  const _id = { name: 'email', type: 'json', index: { fields: ['email'] } }
  _user.index(_id)
}
