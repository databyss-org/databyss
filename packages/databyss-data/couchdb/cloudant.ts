import Cloudant from '@cloudant/cloudant'

export const cloudant = Cloudant({
  url: `https://${process.env.CLOUDANT_USERNAME}:${process.env.CLOUDANT_PASSWORD}@${process.env.REACT_APP_CLOUDANT_HOST}`,
  maxAttempt: 5,
  plugins: { retry: { retryErrors: false, retryStatusCodes: [429] } },
})

require('cloudant-upsert')(cloudant)
