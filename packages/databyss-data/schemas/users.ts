import { Validator } from 'jsonschema'

const validator = new Validator()

export const userSchema = {
  name: {
    type: 'string',
  },
  email: {
    type: 'string',
  },
  googleId: {
    type: 'string',
  },
  password: {
    type: 'string',
  },
  date: {
    type: 'string',
  },
  defaultAccount: {
    type: 'string',
  },
}
