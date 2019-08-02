import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import Text from '@databyss-org/ui/primitives/Text/Text'
import View from '@databyss-org/ui/primitives/View/View'

const alea = new Alea('views')
const ipsum = () => loremIpsum({ units: 'sentences', count: 4, random: alea })
const ipsums = new Array(6).fill().map(ipsum)

const CaptionedView = ({ caption, children }) => (
  <View mr="medium" height={180} width={240}>
    {children}
    <Text variant="uiTextNormalSemibold">{caption}</Text>
  </View>
)

export default () => (
  <React.Fragment>
    <View mb="medium">
      <Text variant="heading3">Border variants</Text>
    </View>
    <View flexDirection="row" mb="large">
      <CaptionedView caption="none">
        <View borderVariant="none" mb="small">
          <Text variant="uiTextNormal">{ipsums[0]}</Text>
        </View>
      </CaptionedView>
      <CaptionedView caption="thinDark">
        <View borderVariant="thinDark" mb="small">
          <Text variant="uiTextNormal">{ipsums[1]}</Text>
        </View>
      </CaptionedView>
      <CaptionedView caption="thinLight">
        <View borderVariant="thinLight" mb="small">
          <Text variant="uiTextNormal">{ipsums[2]}</Text>
        </View>
      </CaptionedView>
    </View>
  </React.Fragment>
)
