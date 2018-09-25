/* eslint-disable react/no-danger */
import React from 'react'

export default ({ html }) => <div dangerouslySetInnerHTML={{ __html: html }} />
