import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text, View, Grid } from '@databyss-org/ui/primitives'
import { Section } from './'

const alea = new Alea('views')
const ipsum = loremIpsum({ units: 'sentences', count: 4, random: alea })

const CaptionedView = ({ caption, children, ...others }) => (
  <View width={240} {...others}>
    {React.cloneElement(children, { height: 180 })}
    <Text variant="uiTextNormalSemibold">{caption}</Text>
  </View>
)

export default () => (
  <React.Fragment>
    <Section title="Border variants">
      <Grid mb="medium">
        <CaptionedView caption="none">
          <View borderVariant="none" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="thinDark">
          <View borderVariant="thinDark" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="thinLight">
          <View borderVariant="thinLight" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="thickDark">
          <View borderVariant="thickDark" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="thickLight">
          <View borderVariant="thickLight" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
      </Grid>
    </Section>
    <Section title="Padding variants">
      <Grid mb="medium">
        <CaptionedView caption="none">
          <View borderVariant="thinLight" paddingVariant="none" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="small">
          <View borderVariant="thinLight" paddingVariant="small" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="medium">
          <View borderVariant="thinLight" paddingVariant="medium" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="large">
          <View borderVariant="thinLight" paddingVariant="large" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
      </Grid>
    </Section>
    <Section title="Shadow variants" overflow="visible">
      <Grid mb="medium" overflow="visible">
        <CaptionedView caption="button" overflow="visible">
          <View borderVariant="thinLight" shadowVariant="button" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
        <CaptionedView caption="modal" overflow="visible">
          <View borderVariant="thinLight" shadowVariant="modal" mb="small">
            <Text variant="uiTextNormal">{ipsum}</Text>
          </View>
        </CaptionedView>
      </Grid>
    </Section>
  </React.Fragment>
)
