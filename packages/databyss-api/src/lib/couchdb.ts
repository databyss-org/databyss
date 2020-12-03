import { Users, Login, Groups } from '@databyss-org/data/serverdbs'
import userSchema from '@databyss-org/data/schemas/users.json'
import loginSchema from '@databyss-org/data/schemas/login.json'
import groupsSchema from '@databyss-org/data/schemas/groups.json'
import path from 'path'
import { cloudant } from '../../../databyss-services/lib/cloudant'

const fs = require('fs')

const updateUsersDesignDocs = async () => {
  // update Users design doc
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

const updateLoginDesignDocs = async () => {
  // update Users design doc
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
    schema: loginSchema,
  }

  await Login.upsert(_dd._id, () => _dd)
}

const updateGroupsDesignDocs = async () => {
  // update Users design doc
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
    schema: groupsSchema,
  }

  await Groups.upsert(_dd._id, () => _dd)
}

export const updateDesignDocs = async () => {
  await updateUsersDesignDocs()
  await updateLoginDesignDocs()
  await updateGroupsDesignDocs()
}

export const initiateDatabases = async () => {
  // initialize databases if not yet created
  try {
    await cloudant.db.get(`groups`)
  } catch (err) {
    await cloudant.db.create(`groups`)
  }
  try {
    await cloudant.db.get(`login`)
  } catch (err) {
    await cloudant.db.create(`login`)
  }
  try {
    await cloudant.db.get(`users`)
  } catch (err) {
    await cloudant.db.create(`users`)
  }
}
