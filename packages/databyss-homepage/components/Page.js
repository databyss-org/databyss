import React from 'react'
import { Helmet } from 'react-helmet'
import { useMediaQuery } from 'react-responsive'
import View from '@databyss-org/ui/primitives/View/View'
import breakpoints from '@databyss-org/ui/theming/responsive'
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

export const Page = ({ content, theme }) => {
  const is4k = useMediaQuery({ minWidth: breakpoints.largeDesktop })
  const is2k = useMediaQuery({ minWidth: breakpoints.mediumDesktop })

  let backgroundSize = '1800px 1288px'
  if (is2k) {
    backgroundSize = '1920px 1374px'
  }
  if (is4k) {
    backgroundSize = '2800px 2002px'
  }
  return (
    <View
      minHeight="100vh"
      width="100%"
      theme={theme}
      backgroundColor="#191919"
      css={{
        backgroundImage:
          content.backgroundImgSrc && `url(${content.backgroundImgSrc})`,
        backgroundSize,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top -50px center',
        transition: 'background-size 0.5s',
      }}
    >
      {content.sections.map((section, idx) => {
        // console.log('[Page] component', section.component)
        const Component = componentMap[section.component]
        return (
          <Component
            key={`${idx}-${section.title}`}
            {...section}
            type={
              section.component === 'DualBgFeature' ? 'dualBg' : section.type
            }
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
}
