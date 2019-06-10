import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
// import styled from '@emotion/native'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import Text from '@databyss-org/ui/primitives/Text/Text'
//
// const Text = styled.Text({
//   color: 'red',
// })

const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})

export default () => {
  console.log('hello2')
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    </ThemeProvider>
  )
}
