import React from 'react'
import { MenuTagButton, SidebarButton, View } from '@databyss-org/ui/primitives'
import { Grid } from '@databyss-org/ui'
import { Section } from './'

export default () => (
  <React.Fragment>
    <Section title="Editor Menu">
      <Grid mb="small" rowGap="small" columnGap="small">
        <View>
          <SidebarButton variant="sidebarAction">x</SidebarButton>
        </View>
        <View>
          <MenuTagButton variant="menuAction">@ source</MenuTagButton>
        </View>
        <View>
          <MenuTagButton variant="menuAction">location</MenuTagButton>
        </View>
        <View>
          <MenuTagButton variant="menuAction"># topic</MenuTagButton>
        </View>
      </Grid>
    </Section>
  </React.Fragment>
)
