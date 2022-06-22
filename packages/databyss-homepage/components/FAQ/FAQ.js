import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import breakpoints from '@databyss-org/ui/theming/responsive'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import FeatureHeading from '../Features/FeatureHeading'
import {
  featureContentMaxWidth,
  featureHeadingMaxWidth,
} from '../Features/Feature'
import { SectionView } from '../SectionView'

const Question = ({ question }) => (
  <Text variant="uiTextLargeSemibold" color="text.1" mb="em">
    <Markdown source={question} />
  </Text>
)

const Answer = ({ answer }) => {
  const _answer = Array.isArray(answer) ? answer : [answer]
  return (
    <Text variant="uiTextNormal" color="text.3">
      {_answer.map((p, key) => (
        <p key={key}>
          <Markdown source={p} />
        </p>
      ))}
    </Text>
  )
}

const FAQ = ({ title, description, descriptionColor, questionsAndAnswers }) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop })

  return (
    <SectionView>
      <View
        flexGrow="1"
        width="100%"
        mb="extraLarge"
        maxWidth={featureContentMaxWidth}
        px={isTablet ? 'none' : 'medium'}
      >
        <FeatureHeading
          title={title}
          description={description}
          descriptionColor={descriptionColor}
        />
        <View
          flexDirection={isDesktop ? 'row' : 'column'}
          justifyContent="space-between"
          flexWrap="wrap"
        >
          {questionsAndAnswers.map((questionAndAnswer, i) => (
            <View
              key={i}
              mb="medium"
              maxWidth={featureHeadingMaxWidth}
              css={{
                '&:nth-of-type(odd)': {
                  marginRight: isDesktop && '32px',
                },
              }}
            >
              <Question question={questionAndAnswer.question} />
              <Answer answer={questionAndAnswer.answer} />
            </View>
          ))}
        </View>
      </View>
    </SectionView>
  )
}

export default FAQ
