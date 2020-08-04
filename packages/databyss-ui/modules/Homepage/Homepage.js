import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import Hero from '@databyss-org/ui/modules/Homepage/Hero/Hero'
import HighlightedFeature from '@databyss-org/ui/modules/Homepage/Features/HighlightedFeature'
import imgSourceSelection from '@databyss-org/ui/assets/promo_source_selection.png'
import SourceDropdownSvg from '@databyss-org/ui/assets/source_dropdown.svg'
import PDFSvg from '@databyss-org/ui/assets/add_document.svg'
import { useMediaQuery } from 'react-responsive'
import LogoSvg from '@databyss-org/ui/assets/logo_new.svg'
import Navbar from '@databyss-org/ui/modules/Homepage/Hero/Navbar'
import backgroundImage from '@databyss-org/ui/assets/stone_bg.jpg'

const FeatureDescription = ({ isTablet }) => (
  <>
    <View flexShrink="1" mr="large" justifyContent="center">
      <Text variant="heading3" color="text.1" mb="medium">
        Import PDF Annotations
      </Text>
      <Text variant="uiTextMedium" color="text.3" mb="large">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec
        euismod quam. Curabitur at euismod tortor. Mauris vitae sem augue. Sed
        interdum augue ac ex lobortis gravida.
      </Text>
    </View>
    <PDFSvg width={isTablet ? 375 : 200} height="200px" />
  </>
)

const navLinks = [
  { name: 'Home', route: '/' },
  { name: 'Signup', route: '/signup' },
  { name: 'Log in', route: '/login' },
  { name: 'About', route: '/about' },
]

const Homepage = () => {
  const isMobile = useMediaQuery({ maxWidth: 425 })
  const isTablet = useMediaQuery({ minWidth: 768 })
  const isDesktop = useMediaQuery({ minWidth: 1024 })

  const getContentSpacing = () => {
    if (isDesktop) {
      return 'extraLarge'
    }
    if (isTablet) {
      return 'large'
    }
    return 'none'
  }

  return (
    <View minHeight="100vh" width="100%">
      <View
        p="large"
        pb="extraLarge"
        width="100%"
        alignItems="center"
        css={{
          background: `url(${backgroundImage})`,
        }}
      >
        <Navbar navLinks={navLinks} />
        <Hero
          isMobile={isMobile}
          logoSrc={<LogoSvg />}
          title="Databyss"
          headline="You research, dabble, experiment, take notes, and get lost in your thoughts. Databyss is your new word-processor."
          buttonText={
            <>
              <Text variant="uiTextNormalSemibold" color="text.5">
                Sign up
              </Text>{' '}
              <Text variant="uiTextNormal" color="text.5">
                &nbsp;(for free)
              </Text>
            </>
          }
          buttonHref="https://app.databyss.org/signup"
        />
      </View>

      <View backgroundColor="background.1" m={getContentSpacing()} mb="none">
        <HighlightedFeature
          backgroundColor="background.2"
          imgSrc={imgSourceSelection}
          title="The Basics"
          description="Databyss gives you the freedom to organize notes hierarchically (as a long stream of thought) or to build a network of associations by linking sections of your work to sources, topics, and authors."
        />
        <View
          flexGrow="1"
          px={isTablet ? 'none' : 'medium'}
          py="extraLarge"
          flexDirection={isTablet ? 'row' : 'column'}
        >
          <FeatureDescription isTablet={isTablet} />
        </View>
      </View>
      <View flexGrow="1" flexDirection={isTablet ? 'row' : 'column'}>
        <View
          backgroundColor="purple.4"
          px={isDesktop ? 'extraLarge' : 'medium'}
          py="large"
        >
          <SourceDropdownSvg width="440px" height="240px" />
        </View>
        <View
          backgroundColor="purple.5"
          py="large"
          flexShrink="3"
          justifyContent="center"
        >
          <View
            mt={isTablet ? 'none' : 'large'}
            justifyContent="center"
            px={isDesktop ? 'extraLarge' : 'medium'}
          >
            <Text variant="heading3" color="text.1" mb="medium">
              Search For Sources
            </Text>
            <Text variant="uiTextMedium" color="text.3" mb="large">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
              nec euismod quam. Curabitur at euismod tortor. Mauris vitae sem
              augue. Sed interdum augue ac ex lobortis gravida.
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Homepage
