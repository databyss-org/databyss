import React from 'react'
import initStoryshots from '@storybook/addon-storyshots'
import { addDecorator } from '@storybook/react'
import { JssProvider } from 'react-jss'

// generate class names without JSS counter
const generateClassName = (rule, styleSheet) =>
  `${styleSheet.options.classNamePrefix}${rule.key}`

addDecorator(story => (
  <JssProvider generateClassName={generateClassName}>{story()}</JssProvider>
))

initStoryshots({ storyKindRegex: /^Modules/ })
