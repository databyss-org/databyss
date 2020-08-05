import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import Hero from '@databyss-org/ui/modules/Homepage/Hero/Hero'
import HighlightedFeature from '@databyss-org/ui/modules/Homepage/Features/HighlightedFeature'
import imgSourceSelection from '@databyss-org/ui/assets/promo_source_selection.png'
import imgSearchFeature from '@databyss-org/ui/assets/search_feature.png'
import SourceDropdownSvg from '@databyss-org/ui/assets/source_dropdown.svg'
import PDFSvg from '@databyss-org/ui/assets/add_document.svg'
import { useMediaQuery } from 'react-responsive'
import LogoSvg from '@databyss-org/ui/assets/logo_new.svg'
import Navbar from '@databyss-org/ui/modules/Homepage/Hero/Navbar'
import backgroundImage from '@databyss-org/ui/assets/stone_bg.jpg'
import Feature from '@databyss-org/ui/modules/Homepage/Features/Feature'
import {
  tabletBreakpoint,
  desktopBreakpoint,
  largeDesktopBreakpoint,
} from '@databyss-org/ui/theming/mediaBreakpoints'
import { pxUnits } from '@databyss-org/ui/theming/views'

const navLinks = [
  { name: 'Home', route: '/' },
  { name: 'Signup', route: '/signup' },
  { name: 'Log in', route: '/login' },
  { name: 'About', route: '/about' },
]

const Homepage = () => {
  const isTablet = useMediaQuery(tabletBreakpoint)
  const isDesktop = useMediaQuery(desktopBreakpoint)
  const isLargeDesktop = useMediaQuery(largeDesktopBreakpoint)

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

      <View
        backgroundColor="background.1"
        m={getContentSpacing()}
        mb="none"
        alignItems={isLargeDesktop ? 'center' : 'flex-start'}
      >
        <HighlightedFeature
          backgroundColor="background.2"
          imgSrc={imgSourceSelection}
          imgAlt="Interface of the App"
          title="The Basics"
          description="Databyss gives you the freedom to organize notes hierarchically (as a long stream of thought) or to build a network of associations by linking sections of your work to sources, topics, and authors."
        />
        <Feature
          noBg
          svgImg={
            <PDFSvg
              width={isTablet ? pxUnits(375) : pxUnits(200)}
              height={pxUnits(240)}
            />
          }
          imgOnRightSide
          title="Import PDF Annotations"
          description="Drag highlighted and/or annotated PDF files into any Page. Databyss will extract all your margin notes and highlighted passages so you can easily edit and search them."
        />
      </View>
      <Feature
        svgImg={
          <SourceDropdownSvg
            width={isTablet ? pxUnits(440) : pxUnits(320)}
            height={pxUnits(240)}
          />
        }
        leftBgColor="purple.4"
        rightBgColor="purple.5"
        descriptionColor="text.2"
        title="Add Sources"
        description="To add a new source and find the bibliographical data of the text you are annotating, press @ on a new line to search using Google Books, Cross Ref, and/or Open Library."
      />
      <View
        backgroundColor="background.1"
        mx={getContentSpacing()}
        mb="none"
        alignItems={isLargeDesktop ? 'center' : 'flex-start'}
      >
        <Feature
          imgSrc={imgSearchFeature}
          imgOnRightSide
          noBg
          title="Global Search"
          description="Tag your entries with source, topic, and/or author. Search through these classifications to find the entries associated with each one. If you click on one of the entries, Databyss will find the exact Page and location where it was entered. You can also search keyword(s) or phrases."
        />
      </View>
    </View>
  )
}

export default Homepage
