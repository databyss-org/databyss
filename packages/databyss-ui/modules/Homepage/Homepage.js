import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import Hero from '@databyss-org/ui/modules/Homepage/Hero/Hero'
import HighlightedFeature from '@databyss-org/ui/modules/Homepage/Features/HighlightedFeature'
import Feature from '@databyss-org/ui/modules/Homepage/Features/Feature'
import FAQ from '@databyss-org/ui/modules/Homepage/FAQ/FAQ'
import homepageContent from '@databyss-org/ui/modules/Homepage/homepageContent.json'
import { Footer } from './Footer/Footer'

const Homepage = () => (
  <View minHeight="100vh" width="100%" backgroundColor="background.1">
    {homepageContent.sections.map((section) => {
      if (section.component === 'Hero') {
        return (
          <Hero
            key={section.title}
            backgroundImgSrc={section.backgroundImgSrc}
            backgroundColor={section.backgroundColor}
            logoSrc={section.logoSrc}
            title={section.title}
            headline={section.headline}
            ctaButtons={section.ctaButtons}
            navLinks={section.navLinks}
          />
        )
      }
      if (section.component === 'HighlightedFeature') {
        return (
          <HighlightedFeature
            backgroundColor={section.backgroundColor}
            key={section.title}
            title={section.title}
            description={section.description}
            imgSrc={section.imgSrc}
            imgAlt={section.imgAlt}
            imgWidth={section.imgWidth}
            imgHeight={section.imgHeight}
            imgMaxHeight={section.imgMaxHeight}
            videoSrc={section.videoSrc}
          />
        )
      }
      if (
        section.component === 'DefaultFeature' ||
        section.component === 'DualBgFeature'
      ) {
        return (
          <Feature
            key={section.title}
            title={section.title}
            description={section.description}
            descriptionColor={section.descriptionColor}
            imgSrc={section.imgSrc}
            imgAlt={section.imgAlt}
            imgWidth={section.imgWidth}
            imgHeight={section.imgHeight}
            imgMaxHeight={section.imgMaxHeight}
            videoSrc={section.videoSrc}
            imgHasBoxShadow={section.imgHasBoxShadow}
            alignContent={section.alignContent}
            type={
              section.component === 'DualBgFeature' ? 'dualBg' : section.type
            }
            leftBgColor={section.leftBgColor}
            rightBgColor={section.rightBgColor}
          />
        )
      }
      if (section.component === 'FAQ') {
        return (
          <FAQ
            key={section.title}
            title={section.title}
            description={section.description}
            descriptionColor={section.descriptionColor}
            questionsAndAnswers={section.questionsAndAnswers}
          />
        )
      }
      return null
    })}
    <Footer />
  </View>
)

export default Homepage
