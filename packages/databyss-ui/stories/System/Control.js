import React, { useState } from 'react'
import {
  Text,
  BaseControl,
  ToggleControl,
  SwitchControl,
  View,
} from '@databyss-org/ui/primitives'
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
  const [switched, setSwitched] = useState(false)
  return (
    <React.Fragment>
      <Section title="Controls">
        <BaseControl onPress={() => console.log('pressed')}>
          <Text>Text control</Text>
        </BaseControl>
        <BaseControl disabled onPress={() => console.log('pressed')}>
          <Text>Text control (disabled)</Text>
        </BaseControl>
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
      <Section title="Switch Controls">
        <SwitchControl label="switch" value={switched} onChange={setSwitched} />
        <SwitchControl
          label="switch (disabled)"
          value={switched}
          onChange={setSwitched}
          disabled
        />
        <View flexDirection="row" justifyContent="flex-end">
          <SwitchControl
            label="right aligned"
            value={switched}
            onChange={setSwitched}
            alignLabel="left"
          />
        </View>
      </Section>
    </React.Fragment>
  )
}
