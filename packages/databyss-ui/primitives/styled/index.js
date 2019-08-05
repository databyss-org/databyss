import styled from '@emotion/styled'
import shouldForwardProp from '@styled-system/should-forward-prop'

export default (component, styles) =>
  component.default
    ? styled(component.default, { shouldForwardProp })(styles)
    : styled(component)(styles)
