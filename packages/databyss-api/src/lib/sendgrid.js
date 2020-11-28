import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_KEY)

export const send = (msg) => {
  if (process.env.NODE_ENV === 'test') {
    return false
  }
  return sgMail.send(msg)
}
