import styled from '@emotion/styled'
import shouldForwardProp from '@styled-system/should-forward-prop'

export default (component, styles) => {
  let options = {}
  let _component = component.default
  if (!_component) {
    _component = component
  }
  if (typeof _component === 'string') {
    options = { shouldForwardProp }
  }
  return styled(_component, options)(styles)
}
