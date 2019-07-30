import styled from '@emotion/native'
import { Platform } from 'react-native'

export default (component, styles) =>
  component.ios || component.android
    ? styled[Platform.select(component)](styles)
    : styled(component)(styles)

// export default styled
