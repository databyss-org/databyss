import React from 'react'
import { Text, Control } from '@databyss-org/ui/primitives'
import { Section } from './'

export default () => (
  <React.Fragment>
    <Section title="Controls">
      <Control onPress={() => console.log('pressed')}>
        <Text>Text control</Text>
      </Control>
      <Control disabled onPress={() => console.log('pressed')}>
        <Text>Text control (disabled)</Text>
      </Control>
    </Section>
  </React.Fragment>
)
