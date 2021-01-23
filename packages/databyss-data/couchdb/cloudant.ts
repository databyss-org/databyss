import Cloudant from '@cloudant/cloudant'

export const cloudant = Cloudant({
  url: process.env.CLOUDANT_URL,
  maxAttempt: 5,
  plugins: { retry: { retryErrors: false, retryStatusCodes: [429] } },
})

require('cloudant-upsert')(cloudant)
