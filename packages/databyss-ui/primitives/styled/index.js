import styled from '@emotion/styled'

export default (component, styles) =>
  component.default
    ? styled[component.default](styles)
    : styled(component)(styles)
