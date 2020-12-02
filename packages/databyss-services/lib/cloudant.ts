import Cloudant, { ServerScope } from '@cloudant/cloudant'

export const cloudant = Cloudant({
  account: process.env.CLOUDANT_USERNAME,
  password: process.env.CLOUDANT_PASSWORD,
  plugins: 'promises',
}) as ServerScope

require('cloudant-upsert')(cloudant)
