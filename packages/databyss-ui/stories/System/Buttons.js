import React from 'react'
import { Button, View } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Section } from './'

export default () => (
  <React.Fragment>
    <Section title="UI Buttons">
      <Grid mb="small" rowGap="small" columnGap="small">
        <View>
          <Button variant="primaryUi">Primary UI</Button>
        </View>
        <View>
          <Button variant="primaryUi" disabled>
            Primary UI (disabled)
          </Button>
        </View>
      </Grid>
      <Grid mb="small" rowGap="small" columnGap="small">
        <View>
          <Button variant="secondaryUi">Secondary UI</Button>
        </View>
        <View>
          <Button variant="secondaryUi" disabled>
            Secondary UI (disabled)
          </Button>
        </View>
      </Grid>
      <Grid mb="small" rowGap="small" columnGap="small">
        <View>
          <Button variant="uiLink">UI Link Button</Button>
        </View>
        <View>
          <Button variant="uiLink" disabled>
            UI Link Button (disabled)
          </Button>
        </View>
      </Grid>
    </Section>
  </React.Fragment>
)
