import styled from '@emotion/native'
import { Platform } from 'react-native'

export default function getStyled(component, styles) {
  return styled[Platform.select(component)](styles)
}
