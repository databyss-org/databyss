import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text, View, Grid } from '@databyss-org/ui/primitives'
import { Section } from './'

const alea = new Alea('views')
const ipsum = loremIpsum({ units: 'sentences', count: 4, random: alea })

export const CaptionedView = ({
  caption,
  children,
  paddingVariant,
  borderVariant,
  shadowVariant,
  height,
  ...others
}) => (
  <View width={240} {...others}>
    <View
      mb="small"
      height={height}
      paddingVariant={paddingVariant}
      borderVariant={borderVariant}
      shadowVariant={shadowVariant}
    >
      {children}
    </View>
    <Text variant="uiTextNormalSemibold">{caption}</Text>
  </View>
)

CaptionedView.defaultProps = {
  paddingVariant: 'small',
  borderVariant: 'thinLight',
  height: 180,
}

const Ipsum = () => (
  <Text variant="uiTextNormal" css={{ height: '100%', overflow: 'hidden' }}>
    {ipsum}
  </Text>
)

export default () => (
  <React.Fragment>
    <Section title="Border variants">
      <Grid mb="medium">
        <CaptionedView caption="none" borderVariant="none">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="thinDark" borderVariant="thinDark">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="thinLight" borderVariant="thinLight">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="thickDark" borderVariant="thickDark">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="thickLight" borderVariant="thickLight">
          <Ipsum />
        </CaptionedView>
      </Grid>
    </Section>
    <Section title="Padding variants">
      <Grid mb="medium">
        <CaptionedView caption="none" paddingVariant="none">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="small" paddingVariant="small">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="medium" paddingVariant="medium">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="large" paddingVariant="large">
          <Ipsum />
        </CaptionedView>
      </Grid>
    </Section>
    <Section title="Shadow variants">
      <Grid mb="medium">
        <CaptionedView caption="button" shadowVariant="button">
          <Ipsum />
        </CaptionedView>
        <CaptionedView caption="modal" shadowVariant="modal">
          <Ipsum />
        </CaptionedView>
      </Grid>
    </Section>
  </React.Fragment>
)
