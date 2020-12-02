import { Users } from '@databyss-org/data/serverdbs'
import userSchema from '@databyss-org/data/schemas/users.json'
import path from 'path'

const fs = require('fs')

export const updateAuthValidationDocs = async () => {
  const _dd = {
    _id: '_design/schema_validation',
    validate_doc_update: fs
      .readFileSync(path.join(__dirname, './_helpers/validate_doc_update.js'))
      .toString(),
    libs: {
      tv4: fs
        .readFileSync(path.join(__dirname, './_helpers/tv4.js'))
        .toString(),
    },
    schema: userSchema,
  }

  await Users.upsert(_dd._id, () => _dd)
}
