import React from 'react'
import { View, Text, Icon } from '@databyss-org/ui/primitives'
import Navbar from '@databyss-org/ui/modules/Homepage/Navbar'
import SignUpForm from '@databyss-org/ui/modules/Homepage/SignUpForm'
import LogoSvg from '@databyss-org/ui/assets/logo_new.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
// import { useMediaQuery } from 'react-responsive'
import imgSourceSelection from '@databyss-org/ui/assets/promo_source_selection.png'

const HeroText = () => (
  <View alignItems="center" mt="large">
    <View flexDirection="row" alignItems="center" mb="large">
      <Icon color="text.6" sizeVariant="logo" mr="small">
        <LogoSvg />
      </Icon>
      <Text variant="heading1" color="text.6" textAlign="center">
        Databyss
      </Text>
    </View>
    <Text
      variant="uiTextMedium"
      color="text.5"
      textAlign="center"
      maxWidth={pxUnits(560)}
      mb={pxUnits(48)}
    >
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec
      euismod quam. Curabitur at euismod tortor. Mauris vitae sem augue. Sed
      interdum augue ac ex lobortis gravida.
    </Text>
  </View>
)

const FeatureDescription = () => (
  <>
    <View flexShrink="1" mr="large">
      <Text variant="heading3" color="text.1" mb="medium">
        Add Sources
      </Text>
      <Text variant="uiTextMedium" color="text.3">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec
        euismod quam. Curabitur at euismod tortor. Mauris vitae sem augue. Sed
        interdum augue ac ex lobortis gravida.
      </Text>
    </View>
    <img
      src={imgSourceSelection}
      alt="Dropdown menu for sources"
      width="60%"
      css={{
        alignSelf: 'flex-start',
      }}
    />
  </>
)

const Homepage = () => (
  <>
    <View p="large" pb="extraLarge" width="100%" backgroundColor="background.6">
      <Navbar />
      <HeroText />
      <SignUpForm />
    </View>
    <View
      backgroundColor="background.1"
      flexGrow="1"
      p="large"
      flexDirection="row"
    >
      <FeatureDescription />
    </View>
  </>
)

export default Homepage
