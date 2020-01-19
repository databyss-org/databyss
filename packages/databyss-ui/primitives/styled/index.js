import styled from '@emotion/styled'
import shouldForwardProp from '@styled-system/should-forward-prop'

const _shouldForwardProp = prop =>
  shouldForwardProp(prop) &&
  (process.env.NODE_ENV !== 'production' ||
    process.env.BABEL_ENV === 'test' ||
    process.env.CI === 'true' ||
    !prop.match('data-test-'))

export default (component, styles) => {
  let options = {}
  let _component = component.default
  if (!_component) {
    _component = component
  }
  if (typeof _component === 'string') {
    options = { shouldForwardProp: _shouldForwardProp }
  }
  return styled(_component, options)(styles)
}
