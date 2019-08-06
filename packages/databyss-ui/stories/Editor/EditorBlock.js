import React from 'react'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Text, View } from '@databyss-org/ui/primitives'
import { EditorProvider } from '@databyss-org/ui'
import { Content, Grid } from '@databyss-org/ui'
import { Section } from './'

export default () => (
  <React.Fragment>
    <Content>
      <Section title="Editor">
        <EditorProvider />
      </Section>
    </Content>
  </React.Fragment>
)
