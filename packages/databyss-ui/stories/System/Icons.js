import React from 'react'
import { View, Icon, Text } from '@databyss-org/ui/primitives'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import { Grid } from '@databyss-org/ui'
import { Section } from './'

const LabeledIcon = ({ label, sizeVariant, children, color, ...others }) => (
  <View alignItems="center" justifyContent="center" {...others}>
    <Icon sizeVariant={sizeVariant} color={color} flexGrow={1}>
      {children}
    </Icon>
    <Text variant="uiTextSmall">{label}</Text>
  </View>
)

export default () => (
  <Section title="Icons">
    <Grid mb="medium" rowGap="medium" columnGap="medium">
      <LabeledIcon label="Tiny" sizeVariant="tiny">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Small" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Medium" sizeVariant="medium">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Large" sizeVariant="large">
        <SourceSvg />
      </LabeledIcon>
    </Grid>
    <Grid mb="small" rowGap="medium" columnGap="medium">
      <LabeledIcon label="Default" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Gray 3" color="gray.3" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Blue 2" color="blue.2" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
      <LabeledIcon label="Primary" color="primary.0" sizeVariant="small">
        <SourceSvg />
      </LabeledIcon>
    </Grid>
  </Section>
)
