import { Client, Configuration } from 'bugsnag-react-native'

export default (_, options) => {
  const configuration = new Configuration()
  console.log('bugsnag', options)
  Object.assign(configuration, options)
  return new Client(configuration)
}
