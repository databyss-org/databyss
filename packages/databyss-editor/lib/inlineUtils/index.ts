export { setAtomicWithoutSuggestion } from './setAtomicWithoutSuggestion'
export { enterAtEndOfInlineAtomic } from './enterAtEndOfInlineAtomic'
export { onBakeInlineAtomic } from './onBakeInlineAtomic'
export { onInlineKeyPress } from './onInlineKeyPress'
export { onInlineFocusBlur } from './onInlineFocusBlur'
export { preventInlineAtomicCharacters } from './preventInlineAtomicCharacters'
export { initiateInlineMenu } from './initiateInlineMenu'
export { onInlineFieldBackspace } from './onInlineFieldBackspace'
export { onEnterInlineField } from './onEnterInlineField'
export { onEscapeInInlineAtomicField } from './onEscapeInInlineAtomicField'
export { preventMarksOnInline } from './preventMarksOnInline'
export { initiateEmbedInput } from './initiateEmbedInput'
export { setEmbedMedia } from './setEmbedMedia'
export { onLinkBackspace } from './onLinkBackspace'

export enum InlineInitializer {
  embed = '<<',
  link = '>>',
}
