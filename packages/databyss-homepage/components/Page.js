import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { Hero } from './Hero/Hero'
import { LongHero } from './Hero/LongHero'
import HighlightedFeature from './Features/HighlightedFeature'
import Feature from './Features/Feature'
import { LongFeature } from './Features/LongFeature'
import FAQ from './FAQ'
import { Footer } from './Footer'
import { SectionHeading } from './SectionHeading'
import { SectionSeparator } from './SectionSeparator'

const componentMap = {
  Hero,
  LongHero,
  HighlightedFeature,
  FAQ,
  SectionHeading,
  SectionSeparator,
  LongFeature,
  DefaultFeature: Feature,
  DualBgFeature: Feature,
}

export const Page = ({ content }) => (
  <View minHeight="100vh" width="100%" backgroundColor="background.1">
    {content.sections.map((section, idx) => {
      console.log('[Page] component', section.component)
      const Component = componentMap[section.component]
      return (
        <Component
          key={`${idx}-${section.title}`}
          {...section}
          type={section.component === 'DualBgFeature' ? 'dualBg' : section.type}
        />
      )
    })}
    <Footer />
  </View>
)
