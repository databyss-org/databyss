import React, { useState } from 'react'
import {
  Text,
  BaseControl,
  ToggleControl,
  SwitchControl,
  TextControl,
  View,
  Icon,
  List,
} from '@databyss-org/ui/primitives'
import TextInput from '@databyss-org/ui/primitives/Control/native/TextInput'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section } from './'

const alea = new Alea('views')
const ipsum = loremIpsum({ units: 'sentences', count: 1, random: alea })

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
  const [textValue, setTextValue] = useState({ textValue: 'Jacques Derrida' })
  const [textValue2, setTextValue2] = useState({ textValue: 'Of Grammatology' })
  const [textValue3, setTextValue3] = useState({
    textValue: 'Johns Hopkins University Press',
  })
  const [textValue4, setTextValue4] = useState({ textValue: ipsum })
  return (
    <React.Fragment>
      <Section title="Base Control">
        <View backgroundColor="background.1">
          <List>
            <BaseControl onPress={() => console.log('pressed')}>
              <Text variant="uiTextSmall">Base control</Text>
            </BaseControl>
            <BaseControl disabled onPress={() => console.log('pressed')}>
              <Text variant="uiTextSmall">Base control (disabled)</Text>
            </BaseControl>
            <BaseControl
              onPress={() => console.log('icon pressed')}
              childViewProps={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon sizeVariant="tiny" mr="tiny">
                <SourceSvg />
              </Icon>
              <Text variant="uiTextSmall">Icon control</Text>
            </BaseControl>
          </List>
        </View>
      </Section>
      <Section title="Text Control" overflow="visible">
        <View backgroundColor="background.1" overflow="visible">
          <List overflow="visible">
            <TextControl
              labelProps={{
                width: '20%',
              }}
              label="Author"
              value={textValue}
              onChange={value => setTextValue(value)}
            />
            <TextControl
              labelProps={{
                width: '20%',
              }}
              label="Title"
              value={textValue2}
              onChange={value => setTextValue2(value)}
            />
            <TextControl
              labelProps={{
                width: '20%',
              }}
              label="Publisher"
              value={textValue3}
              onChange={value => setTextValue3(value)}
            />
            <TextControl
              labelProps={{
                width: '20%',
              }}
              label="Abstract"
              value={textValue4}
              onChange={value => setTextValue4(value)}
              gridFlexWrap="nowrap"
            />
          </List>
        </View>
      </Section>
      <Section title="Toggle Control">
        <View backgroundColor="background.1">
          <List>
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
          </List>
        </View>
      </Section>
      <Section title="Switch Control">
        <View backgroundColor="background.1">
          <List>
            <SwitchControl
              label="switch"
              value={switched}
              onChange={setSwitched}
            />
            <SwitchControl
              label="switch (disabled)"
              value={switched}
              onChange={setSwitched}
              disabled
            />
            <SwitchControl
              justifySelf="flex-end"
              label="right aligned"
              value={switched}
              onChange={setSwitched}
              alignLabel="left"
            />
          </List>
        </View>
      </Section>
      <Section title="Filler Text">
        <Text>
          {ipsum}
          {ipsum}
          {ipsum}
          {ipsum}
        </Text>
      </Section>
    </React.Fragment>
  )
}
