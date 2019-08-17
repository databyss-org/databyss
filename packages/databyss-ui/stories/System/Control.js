import React, { useState } from 'react'
import { Text, Control, ToggleControl, View } from '@databyss-org/ui/primitives'
import { Section } from './'

const Checkbox = ({ checked }) => (
  <View
    borderVariant="thickDark"
    width={15}
    height={15}
    flexGrow={0}
    bg={checked ? 'blue.3' : 'white'}
  />
)

export default () => {
  const [checked, setChecked] = useState(false)
  return (
    <React.Fragment>
      <Section title="Controls">
        <Control onPress={() => console.log('pressed')}>
          <Text>Text control</Text>
        </Control>
        <Control disabled onPress={() => console.log('pressed')}>
          <Text>Text control (disabled)</Text>
        </Control>
      </Section>
      <Section title="Toggle Controls">
        <ToggleControl label="toggle" value={checked} onChange={setChecked}>
          <Checkbox checked={checked} />
        </ToggleControl>
        <ToggleControl
          label="toggle (disabled)"
          value={checked}
          onChange={setChecked}
          disabled
        >
          <Checkbox checked={checked} />
        </ToggleControl>
      </Section>
    </React.Fragment>
  )
}
