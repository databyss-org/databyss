import { Users, Logins, Groups } from '@databyss-org/data/serverdbs'
import {
  userSchema,
  loginSchema,
  groupSchema,
} from '@databyss-org/data/schemas'
import { CouchDB, DesignDoc } from '@databyss-org/data/interfaces'
import { JSONSchema4 } from 'json-schema'
import path from 'path'
import { cloudant } from '../../../databyss-services/lib/cloudant'

const fs = require('fs')

const updateDesignDoc = async <D>(schema: JSONSchema4, db: CouchDB<D>) => {
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
  ;[
    [userSchema, Users],
    [loginSchema, Logins],
    [groupSchema, Groups],
  ].forEach((t) => updateDesignDoc(t[0], t[1]))
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
