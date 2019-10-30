import React from 'react'
import { View } from 'react-native'
import { ThemeProvider } from '@databyss-org/ui/theming'
import Text from '@databyss-org/ui/primitives/Text/Text'
import { TextInput } from '@databyss-org/ui/primitives'
import Button from '@databyss-org/ui/primitives/Button/Button'

console.disableYellowBox = true

// client id
// 282602380521-vq3m78u53vqk2rrqqj43lg021if7jhj7.apps.googleusercontent.com

const App = () => (
  <ThemeProvider>
    <View>
      <Text> Text </Text>
      <TextInput
        value=""
        placeholderq="placeholder"
        onChange={e => console.log(e)}
      />
      <Button label="Primary" buttonType="primary" />
      <Button label="Secondary" buttonType="secondary" />
      <Button label="External" buttonType="external" />
      <Button label="Link" buttonType="link" />
    </View>
  </ThemeProvider>
)

export default App
