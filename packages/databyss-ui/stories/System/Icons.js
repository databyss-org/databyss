import React from 'react'
import { View, Text, Grid } from '@databyss-org/ui/primitives'
import * as Icons from '@databyss-org/ui/assets/icons'
import { Section } from './'

const LabeledIcon = ({ label, children, ...others }) => (
  <View alignItems="center" justifyContent="center" {...others}>
    {children}
    <Text variant="uiTextSmall">{label}</Text>
  </View>
)

export default () => (
  <React.Fragment>
    <Section title="Icon Styles">
      <Grid mb="medium" rowGap="medium" columnGap="medium">
        <LabeledIcon label="Tiny">
          <Icons.SourceIcon sizeVariant="tiny" />
        </LabeledIcon>
        <LabeledIcon label="Small">
          <Icons.SourceIcon sizeVariant="small" />
        </LabeledIcon>
        <LabeledIcon label="Medium">
          <Icons.SourceIcon sizeVariant="medium" />
        </LabeledIcon>
        <LabeledIcon label="Large">
          <Icons.SourceIcon sizeVariant="large" />
        </LabeledIcon>
      </Grid>
      <Grid mb="medium" rowGap="medium" columnGap="medium">
        <LabeledIcon label="Default">
          <Icons.SourceIcon sizeVariant="small" />
        </LabeledIcon>
        <LabeledIcon label="Gray 3" sizeVariant="small">
          <Icons.SourceIcon sizeVariant="small" color="gray.3" />
        </LabeledIcon>
        <LabeledIcon label="Blue 2" sizeVariant="small">
          <Icons.SourceIcon sizeVariant="small" color="blue.2" />
        </LabeledIcon>
        <LabeledIcon label="Primary" color="primary.0" sizeVariant="small">
          <Icons.SourceIcon sizeVariant="small" color="blue.2" />
        </LabeledIcon>
      </Grid>
    </Section>
    <Section title="Icon Glyphs">
      <Grid mb="medium" rowGap="medium" columnGap="medium">
        {Object.keys(Icons).map(name => (
          <LabeledIcon
            label={name.replace('Icon', '')}
            sizeVariant="small"
            key={name}
          >
            {React.createElement(Icons[name])}
          </LabeledIcon>
        ))}
      </Grid>
    </Section>
  </React.Fragment>
)
