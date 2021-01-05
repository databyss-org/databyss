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
import { cloudant } from '../../../databyss-services/lib/cloudant'

const fs = require('fs')

export const updateClientDesignDoc = async (db: DocumentScope<DesignDoc>) => {
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
        .readFileSync(path.join(__dirname, './_design_doc_includes/tv4.js.es5'))
        .toString(),
    },
    schema: JSON.stringify(loginSchema),
    // sourceSchema: JSON.stringify(sourceSchema),
    // textSchema: JSON.stringify(textSchema),
  }

  await db.upsert(_dd._id, () => _dd)
  console.log('AFTER UPSERT OF DESIGN DOCUMENT')
}

const updateDesignDoc = async (
  schema: JSONSchema4,
  db: DocumentScope<DesignDoc>
) => {
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
        .readFileSync(path.join(__dirname, './_design_doc_includes/tv4.js.es5'))
        .toString(),
    },
    schema: JSON.stringify(schema),
  }
  await db.upsert(_dd._id, () => _dd)
}

export const updateDesignDocs = async () => {
  const _designDatabaseTuple: [JSONSchema4, DocumentScope<DesignDoc>][] = [
    [userSchema, UsersDesignDoc],
    [loginSchema, LoginsDesignDoc],
    [groupSchema, GroupsDesignDoc],
  ]

  _designDatabaseTuple.forEach((t) => updateDesignDoc(t[0], t[1]))
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
}
