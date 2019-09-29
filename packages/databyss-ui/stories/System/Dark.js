import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text, View } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Section } from './'
import { darkTheme } from '../../theming/theme'

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
    <Section title="Dark mode" bg="background.0" theme={darkTheme}>
      <Grid mb="medium">
        <CaptionedView caption="medium">
          <View
            bg="background.0"
            theme={darkTheme}
            borderVariant="thinLight"
            paddingVariant="medium"
            mb="small"
          >
            <Text variant="uiTextNormal" theme={darkTheme}>
              {ipsum}
            </Text>
          </View>
        </CaptionedView>
      </Grid>
    </Section>
  </React.Fragment>
)
