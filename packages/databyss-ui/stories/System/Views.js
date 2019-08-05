import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text, View } from '@databyss-org/ui/primitives'
import { Section } from './'

const alea = new Alea('views')
const ipsum = loremIpsum({ units: 'sentences', count: 4, random: alea })

const CaptionedView = ({ caption, children }) => (
  <View mr="medium" height={180} width={240} mb="medium">
    {children}
    <Text variant="uiTextNormalSemibold">{caption}</Text>
  </View>
)

export default () => (
  <React.Fragment>
    <Section title="Border variants">
      <View flexDirection="row" flexWrap="wrap">
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
      </View>
    </Section>
    <Section title="Padding variants">
      <View flexDirection="row" flexWrap="wrap" mb="large">
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
      </View>
    </Section>
  </React.Fragment>
)
