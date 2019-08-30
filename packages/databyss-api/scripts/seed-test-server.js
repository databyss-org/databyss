require('../../../config/env')
const helpers = require('../__tests__/_helpers')
const { dropTestDB } = require('../db')

const { createUser, createPage, POST_EXAMPLE } = helpers

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
    await createPage(token, POST_EXAMPLE)
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
