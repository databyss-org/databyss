import React from 'react'
import loremIpsum from 'lorem-ipsum'
import Text from '@databyss-org/ui/primitives/Text/Text'

export default () => (
  <React.Fragment>
    <Text variant="heading3">Headings</Text>
    <Text variant="heading1">Heading 1</Text>
    <Text>{loremIpsum({ units: 'sentences', count: 2 })}</Text>

    <Text variant="heading2">Heading 2</Text>
    <Text>{loremIpsum({ units: 'sentences', count: 2 })}</Text>

    <Text variant="heading3">Heading 3</Text>
    <Text>{loremIpsum({ units: 'sentences', count: 2 })}</Text>

    <Text variant="heading4">Heading 4</Text>
    <Text>{loremIpsum({ units: 'sentences', count: 2 })}</Text>
  </React.Fragment>
)
