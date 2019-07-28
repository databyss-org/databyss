import { AppRegistry } from 'react-native'
import { getStorybookUI, configure } from '@storybook/react-native'
import { name as appName } from './app.json'

// Uncomment this line for addons
// import './rn-addons'

// import stories
configure(() => {
  require('./stories')
}, module)

// Refer to https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({})

AppRegistry.registerComponent(appName, () => StorybookUIRoot)

console.disableYellowBox = true

export default StorybookUIRoot
