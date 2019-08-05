import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text, View } from '@databyss-org/ui/primitives'
import { Content } from '@databyss-org/ui'
import { Section } from './'

const alea = new Alea('typography')
const ipsum = () => loremIpsum({ units: 'sentences', count: 2, random: alea })
const ipsums = new Array(4).fill().map(ipsum)

const TextVariant = ({ variant, children }) => (
  <View mb="small">
    <Text variant={variant}>{children}</Text>
  </View>
)

export default () => (
  <React.Fragment>
    <Content>
      <Section title="Headings">
        <View mb="medium">
          <Text variant="heading1">Heading 1</Text>
          <Text>{ipsums[0]}</Text>
        </View>

        <View mb="medium">
          <Text variant="heading2">Heading 2</Text>
          <Text>{ipsums[1]}</Text>
        </View>

        <View mb="medium">
          <Text variant="heading3">Heading 3</Text>
          <Text>{ipsums[2]}</Text>
        </View>

        <View mb="medium">
          <Text variant="heading4">Heading 4</Text>
          <Text>{ipsums[3]}</Text>
        </View>
      </Section>
    </Content>
    <Section title="UI Text">
      <View flexDirection="row" flexWrap="wrap">
        <View mr="medium">
          <TextVariant variant="uiTextLarge">UITextLarge</TextVariant>
          <TextVariant variant="uiTextNormal">UITextNormal</TextVariant>
          <TextVariant variant="uiTextSmall">UITextSmall</TextVariant>
        </View>
        <View mr="medium">
          <TextVariant variant="uiTextLargeSemibold">
            UITextLargeSemibold
          </TextVariant>
          <TextVariant variant="uiTextNormalSemibold">
            UITextNormalSemibold
          </TextVariant>
          <TextVariant variant="uiTextSmallSemibold">
            UITextSmallSemibold
          </TextVariant>
        </View>
        <View mr="medium">
          <TextVariant variant="uiTextLargeUnderline">
            UITextLargeUnderline
          </TextVariant>
          <TextVariant variant="uiTextNormalUnderline">
            UITextNormalUnderline
          </TextVariant>
          <TextVariant variant="uiTextSmallUnderline">
            UITextSmallUnderline
          </TextVariant>
        </View>
        <View mr="medium">
          <TextVariant variant="uiTextLargeSemiboldUnderline">
            UITextLargeSemiboldUnderline
          </TextVariant>
          <TextVariant variant="uiTextNormalSemiboldUnderline">
            UITextNormalSemiboldUnderline
          </TextVariant>
          <TextVariant variant="uiTextSmallSemiboldUnderline">
            UITextSmallSemiboldUnderline
          </TextVariant>
        </View>
        <View mr="medium" />
      </View>
    </Section>
  </React.Fragment>
)
