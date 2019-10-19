import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text, View, Grid } from '@databyss-org/ui/primitives'
import { Section } from './'

const alea = new Alea('views')
const ipsum = loremIpsum({ units: 'sentences', count: 4, random: alea })

const CaptionedView = ({ caption, children, ...others }) => (
  <View width={240} {...others}>
    <View>
      {React.cloneElement(children, {
        height: 180,
        mb: 'small',
        paddingVariant: 'small',
        ...children.props,
      })}
    </View>
    <Text variant="uiTextNormalSemibold">{caption}</Text>
  </View>
)

const Ipsum = () => (
  <Text variant="uiTextNormal" css={{ height: '100%', overflow: 'hidden' }}>
    {ipsum}
  </Text>
)

export default () => (
  <React.Fragment>
    <Section title="Border variants">
      <Grid mb="medium">
        <CaptionedView caption="none">
          <View borderVariant="none">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="thinDark">
          <View borderVariant="thinDark">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="thinLight">
          <View borderVariant="thinLight">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="thickDark">
          <View borderVariant="thickDark">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="thickLight">
          <View borderVariant="thickLight">
            <Ipsum />
          </View>
        </CaptionedView>
      </Grid>
    </Section>
    <Section title="Padding variants">
      <Grid mb="medium">
        <CaptionedView caption="none">
          <View borderVariant="thinLight" paddingVariant="none">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="small">
          <View borderVariant="thinLight" paddingVariant="small">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="medium">
          <View borderVariant="thinLight" paddingVariant="medium">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="large">
          <View borderVariant="thinLight" paddingVariant="large">
            <Ipsum />
          </View>
        </CaptionedView>
      </Grid>
    </Section>
    <Section title="Shadow variants">
      <Grid mb="medium">
        <CaptionedView caption="button">
          <View borderVariant="thinLight" shadowVariant="button">
            <Ipsum />
          </View>
        </CaptionedView>
        <CaptionedView caption="modal">
          <View borderVariant="thinLight" shadowVariant="modal">
            <Ipsum />
          </View>
        </CaptionedView>
      </Grid>
    </Section>
  </React.Fragment>
)
