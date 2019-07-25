import React, { Fragment } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
} from 'react-native'

import { ThemeProvider } from '@databyss-org/ui/theming'
import Text from '@databyss-org/ui/primitives/Text/Text'
import TextInput from '@databyss-org/ui/primitives/TextInput/TextInput'
import Button from '@databyss-org/ui/primitives/Button/Button'

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen'

console.disableYellowBox = true

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionDescription: {
    marginTop: 8,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
})

const styleProps = {
  sectionTitle: {
    textSize: 'large',
    fontWeight: 'semiBold',
  },
}

const App = () => (
  <ThemeProvider>
    <View>
      <Text> hello</Text>
      <TextInput
        value=""
        placeholder="placeholder"
        onChange={e => console.log(e)}
      />
      <Button label="butttttton" style="external" />
    </View>
  </ThemeProvider>
)

export default App
