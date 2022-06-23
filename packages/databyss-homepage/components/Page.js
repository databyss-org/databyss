import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import Hero from './Hero/Hero'
import HighlightedFeature from './Features/HighlightedFeature'
import Feature from './Features/Feature'
import FAQ from './FAQ/FAQ'
import { Footer } from './Footer/Footer'

const componentMap = {
  Hero,
  HighlightedFeature,
  FAQ,
  DefaultFeature: Feature,
  DualBgFeature: Feature,
}

export const Page = ({ content }) => (
  <View minHeight="100vh" width="100%" backgroundColor="background.1">
    {content.sections.map((section) => {
      console.log('[Page] component', section.component)
      const Component = componentMap[section.component]
      return (
        <Component
          key={section.title}
          {...section}
          type={section.component === 'DualBgFeature' ? 'dualBg' : section.type}
        />
      )
    })}
    <Footer />
  </View>
)
