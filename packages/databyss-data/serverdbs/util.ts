import {
  LoginsDesignDoc,
  GroupsDesignDoc,
  UsersDesignDoc,
} from '@databyss-org/data/serverdbs'
import {
  userSchema,
  loginSchema,
  groupSchema,
  sourceSchema,
  textSchema,
} from '@databyss-org/data/schemas'
import { DocumentScope } from 'nano'
import { DesignDoc } from '@databyss-org/data/interfaces'
import { JSONSchema4 } from 'json-schema'
import path from 'path'
import { cloudant } from './cloudant'

const fs = require('fs')

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

const updateDesignDoc = async ({
  schema,
  db,
  script,
}: {
  db: DocumentScope<DesignDoc>
  script: string
  schema?: JSONSchema4
}) => {
  const _dd: DesignDoc = {
    _id: '_design/schema_validation',
    validate_doc_update: fs
      .readFileSync(path.join(__dirname, script))
      .toString(),
    libs: {
      tv4: fs
        .readFileSync(path.join(__dirname, './_design_doc_includes/tv4.js.es5'))
        .toString(),
    },
    schema,
    sourceSchema,
    textSchema,
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
      script: './_design_doc_includes/validate_doc_update.js.es5',
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
