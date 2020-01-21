import React from 'react'
import { View, Button, Icon, Grid, Text } from '@databyss-org/ui/primitives'
import PlusSvg from '../../assets/add.svg'
import { editorMarginMenuItemHeight } from '../../theming/buttons'
import { Section } from './'

const MarkButton = ({ isActive, label, variant }) => (
  <Button variant="formatButton">
    <Text
      variant={variant}
      pr="extraSmall"
      pl="extraSmall"
      color={isActive ? 'primary.1' : 'text.1'}
    >
      {label}
    </Text>
  </Button>
)

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
          <Button variant="uiTextButton">UI Text Button</Button>
        </View>
        <View>
          <Button variant="uiTextButton" disabled>
            UI Text Button (disabled)
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
    <Section title="Editor Buttons">
      <Grid mb="small" rowGap="small" columnGap="small">
        <View>
          <Button variant="editorMarginMenuItem">
            <Icon
              width={editorMarginMenuItemHeight * 0.5}
              height={editorMarginMenuItemHeight * 0.5}
              sizeVariant="tiny"
            >
              <PlusSvg />
            </Icon>
          </Button>
        </View>
        <View>
          <MarkButton label="b" variant="uiTextBold" />
        </View>
      </Grid>
    </Section>
    <Section title="Editor Menu Buttons">
      <Grid mb="small" rowGap="small" columnGap="small">
        <View>
          <Button variant="editorMarginMenuItem">button action</Button>
        </View>
      </Grid>
    </Section>
  </React.Fragment>
)
