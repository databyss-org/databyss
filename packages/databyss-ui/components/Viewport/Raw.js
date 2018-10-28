/* eslint-disable react/no-danger */
import React from 'react'

export default ({ html, className, Tag = 'div', ariaRole, ariaLabel }) => (
  <Tag
    className={className}
    dangerouslySetInnerHTML={{ __html: html }}
    role={ariaRole}
    aria-label={ariaLabel}
  />
)
