import Cloudant from '@cloudant/cloudant'

export const cloudant = Cloudant({
  account: process.env.CLOUDANT_USERNAME,
  password: process.env.CLOUDANT_PASSWORD,
  maxAttempt: 5,
  plugins: { retry: { retryErrors: false, retryStatusCodes: [429] } },
})

require('cloudant-upsert')(cloudant)
