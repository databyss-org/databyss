import Cloudant from '@cloudant/cloudant'

export const cloudant = Cloudant({
  account: process.env.CLOUDANT_USERNAME,
  password: process.env.CLOUDANT_PASSWORD,
  plugins: 'promises',
})

require('cloudant-upsert')(cloudant)
