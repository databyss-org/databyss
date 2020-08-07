import React from 'react'
import { View, Text } from '@databyss-org/ui/primitives'
import { useMediaQuery } from 'react-responsive'
import FeatureHeading from '@databyss-org/ui/modules/Homepage/Features/FeatureHeading'
import { featureContentMaxWidth } from '@databyss-org/ui/modules/Homepage/Features/Feature'
import {
  desktopBreakpoint,
  tabletBreakpoint,
} from '@databyss-org/ui/theming/mediaBreakpoints'

const Question = ({ question }) => (
  <Text variant="uiTextLargeSemibold" color="text.1" mb="em">
    {question}
  </Text>
)

const Answer = ({ answer }) => (
  <Text variant="uiTextNormal" color="text.3">
    {answer}
  </Text>
)

const FAQ = ({
  title,
  description,
  descriptionColor,
  marginX,
  questionsAndAnswers,
}) => {
  const isDesktop = useMediaQuery(desktopBreakpoint)
  const isTablet = useMediaQuery(tabletBreakpoint)

  return (
    <View backgroundColor="background.1" mx={marginX} alignItems="center">
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
        >
          {questionsAndAnswers.map(questionAndAnswer => (
            <View
              widthVariant="content"
              mb="medium"
              maxWidth={isDesktop ? '50%' : '100%'}
              css={{
                '&:nth-child(even)': {
                  paddingLeft: isDesktop && '32px',
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
