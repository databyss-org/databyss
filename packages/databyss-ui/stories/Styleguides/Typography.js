import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import Text from '@databyss-org/ui/primitives/Text/Text'

const alea = new Alea('typeography')
const ipsum = () => loremIpsum({ units: 'sentences', count: 2, random: alea })

export default () => (
  <React.Fragment>
    <Text variant="heading3">Headings</Text>
    <Text variant="heading1">Heading 1</Text>
    <Text>{ipsum()}</Text>

    <Text variant="heading2">Heading 2</Text>
    <Text>{ipsum()}</Text>

    <Text variant="heading3">Heading 3</Text>
    <Text>{ipsum()}</Text>

    <Text variant="heading4">Heading 4</Text>
    <Text>{ipsum()}</Text>
  </React.Fragment>
)
