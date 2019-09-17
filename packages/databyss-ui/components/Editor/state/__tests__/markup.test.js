import { stateValue, slateValue } from './markupState'
import { stateToSlate, slateToState } from './../../slate/markup'

describe('Markup Translator', () => {
  describe('state value to slate value', () => {
    test('should return correct slate JSON value', () => {
      const _state = stateToSlate(slateValue, '5d6442046e84d304ddceb768')
      expect(_state).toEqual(stateValue)
      const _slate = slateToState(stateValue, '5d6442046e84d304ddceb768')
      expect(_slate).toEqual(slateValue)
    })
  })
})
