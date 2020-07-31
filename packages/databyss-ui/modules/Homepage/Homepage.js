import React from 'react'
import { View, Text, Icon } from '@databyss-org/ui/primitives'
import Navbar from '@databyss-org/ui/modules/Homepage/Navbar'
import SignUpForm from '@databyss-org/ui/modules/Homepage/SignUpForm'
import LogoSvg from '@databyss-org/ui/assets/logo_new.svg'
import { pxUnits, borderRadius } from '@databyss-org/ui/theming/views'
import imgSourceSelection from '@databyss-org/ui/assets/promo_source_selection.png'
import theme from '@databyss-org/ui/theming/theme'
import backgroundImage from '@databyss-org/ui/assets/stone_bg.jpg'
import { useMediaQuery } from 'react-responsive'

const HeroText = ({ isMobile }) => (
  <View alignItems="center" mt="extraLarge">
    <View flexDirection="row" alignItems="center" mb="large">
      <Icon
        color="text.6"
        sizeVariant={isMobile ? 'logoSmall' : 'logoLarge'}
        mr="small"
      >
        <LogoSvg />
      </Icon>
      <Text
        variant={isMobile ? 'heading2' : 'heading1'}
        color="text.6"
        textAlign="center"
      >
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
      A note-taking application with the feel of a word-processor. Your notes
      can be organized by source, topic and location. PDF highlights can be
      extracted, searched and edited.
    </Text>
  </View>
)

const FeatureDescription = ({ isTablet }) => (
  <>
    <View flexShrink="1" mr="large">
      <Text variant="heading3" color="text.1" mb="medium">
        Add Sources
      </Text>
      <Text variant="uiTextMedium" color="text.3" mb="large">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec
        euismod quam. Curabitur at euismod tortor. Mauris vitae sem augue. Sed
        interdum augue ac ex lobortis gravida.
      </Text>
    </View>
    <img
      src={imgSourceSelection}
      alt="Dropdown menu for sources"
      width={isTablet ? '60%' : '100%'}
      css={{
        alignSelf: 'flex-start',
        boxShadow: theme.buttonShadow.boxShadow,
        borderRadius,
      }}
    />
  </>
)

const Homepage = () => {
  const isMobile = useMediaQuery({ maxWidth: 425 })
  const isTablet = useMediaQuery({ minWidth: 768 })
  const isDesktop = useMediaQuery({ minWidth: 1024 })

  const getMargins = () => {
    if (isDesktop) {
      return 'extraLarge'
    }
    if (isTablet) {
      return 'extraLarge'
    }
    return 'none'
  }

  return (
    <View minHeight="100vh" width="100%">
      <View
        p="large"
        pb="extraLarge"
        width="100%"
        css={{
          background: `url(${backgroundImage})`,
        }}
      >
        <Navbar />
        <HeroText isMobile={isMobile} />
        <SignUpForm />
      </View>
      <View backgroundColor="background.1" m={getMargins()}>
        <View
          backgroundColor="background.2"
          p="large"
          alignItems="center"
          css={{ borderRadius }}
        >
          <View widthVariant="modal">
            <Text
              variant="heading3"
              color="text.1"
              mb="medium"
              textAlign="center"
            >
              Deep Search
            </Text>
            <Text
              variant="uiTextMedium"
              color="text.3"
              textAlign="center"
              mb="large"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
              nec euismod quam. Curabitur at euismod tortor. Mauris vitae sem
              augue. Sed interdum augue ac ex lobortis gravida.
            </Text>
            <img
              src={imgSourceSelection}
              alt="Deep search"
              width="100%"
              css={{
                alignSelf: 'flex-start',
                boxShadow: theme.buttonShadow.boxShadow,
                borderRadius,
              }}
            />
          </View>
        </View>
        <View
          flexGrow="1"
          px={isTablet ? 'none' : 'medium'}
          py="large"
          flexDirection={isTablet ? 'row' : 'column'}
        >
          <FeatureDescription isTablet={isTablet} />
        </View>
      </View>
    </View>
  )
}

export default Homepage
