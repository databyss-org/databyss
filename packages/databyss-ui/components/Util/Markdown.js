import React from 'react'
import ReactMarkdown from 'react-markdown'

const disallowed = ['paragraph']

const Markdown = ({ source, ...others }) => (
  <ReactMarkdown
    source={source}
    disallowedTypes={disallowed}
    unwrapDisallowed
    linkTarget="_blank"
    {...others}
  />
)

export default Markdown
