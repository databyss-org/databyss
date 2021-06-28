import { MediaTypes } from '@databyss-org/services/interfaces'

export type IframeAttributes = {
  width?: number
  height?: number
  title?: string
  src?: string
  code?: string
  // border?: number
  // frameborder?: number
  mediaType?: MediaTypes
  openGraphJson?: string
}
