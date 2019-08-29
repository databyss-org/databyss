require('../../config/env')
const helpers = require('./__tests__/_helpers')

const { createUser, createPage, POST_EXAMPLE } = helpers

// USER
const EMAIL = 'email4@company.com'
const PASSWORD = 'password'

async function seedTestDatabase() {
  const token = await createUser(EMAIL, PASSWORD)
  await createPage(token, POST_EXAMPLE)
}

if (require.main === module) {
  seedTestDatabase().then(() => {
    process.exit()
  })
}
