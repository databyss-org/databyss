import styled from '@emotion/styled'

export default function getStyled(component, styles) {
  return styled[component.default](styles)
}
