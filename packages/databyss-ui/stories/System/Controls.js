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
import SourceSvg from '@databyss-org/ui/assets/source.svg'
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

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

export const TextControls = ({ labelProps, listProps }) => {
  const [textValue, setTextValue] = useState({ textValue: 'Stamenov' })
  const [textValue2, setTextValue2] = useState({ textValue: 'Maxim' })
  // const [textValue3, setTextValue3] = useState({
  //   textValue: 'Johns Hopkins University Press',
  // })
  const [textValue4, setTextValue4] = useState({
    textValue:
      'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company, 1997. Crossref, doi:10.1075/aicr.12.',
  })
  return (
    <ControlList verticalItemPadding="tiny" {...listProps}>
      <TextControl
        labelProps={{
          width: '25%',
          ...labelProps,
        }}
        label="Citation"
        value={textValue4}
        onChange={(value) => setTextValue4(value)}
        gridFlexWrap="nowrap"
        multiline
      />
      <TextControl
        labelProps={{
          width: '25%',
          ...labelProps,
        }}
        label="Author (First Name)"
        value={textValue}
        onChange={(value) => setTextValue(value)}
        gridFlexWrap="nowrap"
      />
      <TextControl
        labelProps={{
          width: '25%',
          ...labelProps,
        }}
        label="Author (Last Name)"
        value={textValue2}
        onChange={(value) => setTextValue2(value)}
        gridFlexWrap="nowrap"
      />
    </ControlList>
  )
}

TextControls.defaultProps = {
  listProps: {},
}

export default () => {
  const [checked, setChecked] = useState(false)
  const [switched, setSwitched] = useState(false)

  return (
    <React.Fragment>
      <Section title="Base Control">
        <View
          borderVariant="thinLight"
          widthVariant="content"
          backgroundColor="background.0"
        >
          <ControlList>
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
          </ControlList>
        </View>
      </Section>
      <Section title="Text Control">
        <View
          borderVariant="thinLight"
          widthVariant="content"
          backgroundColor="background.0"
        >
          <TextControls />
        </View>
      </Section>
      <Section title="Toggle Control">
        <View
          borderVariant="thinLight"
          widthVariant="content"
          backgroundColor="background.0"
        >
          <ControlList>
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
          </ControlList>
        </View>
      </Section>
      <Section title="Switch Control">
        <View
          borderVariant="thinLight"
          widthVariant="content"
          backgroundColor="background.0"
        >
          <ControlList>
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
          </ControlList>
        </View>
      </Section>
    </React.Fragment>
  )
}
