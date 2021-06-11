import {
  InlineTypes,
  RangeType,
} from '../../../databyss-services/interfaces/Range'
import { InlineInitializer } from '.'

export const inlineTypeToSymbol = (type: InlineTypes) => {
  const _symbol = {
    [InlineTypes.Embed]: InlineInitializer.embed,
    [InlineTypes.Link]: InlineInitializer.link,
  }
  return _symbol[type]
}

export const inlineTypeToInputFieldRange = (type: InlineTypes) => {
  const _rangeType = {
    [InlineTypes.Embed]: RangeType.InlineEmbedInput,
    [InlineTypes.Link]: RangeType.InlineLinkInput,
  }

  return _rangeType[type]
}
