import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text } from '@databyss-org/ui/primitives'
import { Content } from '@databyss-org/ui'

const alea = new Alea('typography')
const ipsum = () => loremIpsum({ units: 'sentences', count: 2, random: alea })
const ipsums = new Array(4).fill().map(ipsum)

export default () => (
  <Content>
    <Text variant="heading3">Headings</Text>
    <Text variant="heading1">Heading 1</Text>
    <Text>{ipsums[0]}</Text>

    <Text variant="heading2">Heading 2</Text>
    <Text>{ipsums[1]}</Text>

    <Text variant="heading3">Heading 3</Text>
    <Text>{ipsums[2]}</Text>

    <Text variant="heading4">Heading 4</Text>
    <Text>{ipsums[3]}</Text>
  </Content>
)
