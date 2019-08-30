import '../../../config/env'
import { POST_EXAMPLE } from '../__tests__/_constants'
import helpers from '../__tests__/_helpers'
import { dropTestDB } from '../src/lib/db'

const { createUser, createPage, newAccountWithUserId } = helpers

// USER
const EMAIL = 'email4@company.com'
const PASSWORD = 'password'

async function seedTestDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    return
  }
  // drop current test db
  // WARNING: this will break currently running tests (local or on CI)
  await dropTestDB()

  console.log('seeding...')
  try {
    const token = await createUser(EMAIL, PASSWORD)
    const accountResponse = await newAccountWithUserId(token)
    const account = JSON.parse(accountResponse.text)
    await createPage(token, account._id, POST_EXAMPLE)
  } catch (err) {
    console.error('error while seeding', err)
  }
  console.log('done seeding')
  process.exit()
}

if (require.main === module) {
  seedTestDatabase().then(() => {
    process.exit()
  })
}

module.exports = { seedTestDatabase }
