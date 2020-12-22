import { ServerClient } from 'postmark'

const postmarkClient =
  process.env.NODE_ENV === 'test'
    ? {}
    : new ServerClient(process.env.POSTMARK_KEY)

export const send = (msg) => {
  if (process.env.NODE_ENV === 'test') {
    console.log('skipping email send in TEST env')
    return false
  }
  return postmarkClient.sendEmailWithTemplate(msg)
}
