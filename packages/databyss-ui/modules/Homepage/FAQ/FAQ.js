import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import {
  featureContentMaxWidth,
  featureHeadingMaxWidth,
} from '@databyss-org/ui/modules/Homepage/Features/Feature'
import breakpoints from '@databyss-org/ui/theming/responsive'
import Markdown from '@databyss-org/ui/components/Util/Markdown'

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
    <View
      backgroundColor="background.1"
      mx={getContentSpacing()}
      alignItems="center"
    >
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
    </View>
  )
}

export default FAQ
