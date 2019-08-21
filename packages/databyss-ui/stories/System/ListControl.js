import React from 'react'
import { Text, ListControl } from '@databyss-org/ui/primitives'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section } from './'

const alea = new Alea('typography')
const ipsum = () => loremIpsum({ units: 'words', count: 4, random: alea })
const longIpsums = new Array(50).fill().map(ipsum)
const shortIpsums = new Array(5).fill().map(ipsum)

export default () => (
  <React.Fragment>
    <Section title="Long List">
      <ListControl
        height={250}
        renderItem={({ item }) => <Text>{item}</Text>}
        data={longIpsums}
        borderVariant="thinDark"
        paddingVariant="small"
      />
    </Section>
    <Section title="Short List">
      <ListControl
        height={200}
        renderItem={({ item }) => <Text>{item}</Text>}
        data={shortIpsums}
        borderVariant="thinDark"
        paddingVariant="small"
        mb="medium"
      />
    </Section>
  </React.Fragment>
)
