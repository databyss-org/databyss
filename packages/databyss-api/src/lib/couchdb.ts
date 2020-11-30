import { Users, Login } from '@databyss-org/data/serverdbs'

const _validate = (newDoc: any) => {
  console.log('[couchdb] 🔍 validate', newDoc)
}

export const updateAuthValidationDocs = async () => {
  const _dd = {
    _id: '_design/schema_validation',
    validate_doc_update: _validate.toString(),
  }

  await Users.upsert(_dd._id, () => _dd)
}
