import React from 'react'
import { Helmet } from 'react-helmet'
import View from '@databyss-org/ui/primitives/View/View'
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

export const Page = ({ content, theme }) => (
  <View
    minHeight="100vh"
    width="100%"
    backgroundColor="#000000"
    theme={theme}
    css={{
      backgroundImage:
        content.backgroundImgSrc && `url(${content.backgroundImgSrc})`,
      backgroundSize: '1800px 1288px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top center',
    }}
  >
    {content.sections.map((section, idx) => {
      // console.log('[Page] component', section.component)
      const Component = componentMap[section.component]
      return (
        <Component
          key={`${idx}-${section.title}`}
          {...section}
          type={section.component === 'DualBgFeature' ? 'dualBg' : section.type}
        />
      )
    })}
    <Footer backgroundImgSrc={content.footerBackgroundImgSrc} />
    <Helmet>
      <title>{content.title}</title>
      {(content.meta ?? []).map((metaJson) => (
        <meta name={metaJson.name} content={metaJson.content} />
      ))}
    </Helmet>
  </View>
)
