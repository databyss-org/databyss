import { stateValue, slateValue } from './markupState'
import { stateToSlate, slateToState } from './../../slate/markup'
import reducer, { entities } from './../page/reducer'
import { setActiveBlockId, setActiveBlockContent } from '../page/actions'

import initialState from './initialState'

const ranges = [
  {
    offset: 0,
    length: 7,
    marks: ['bold', 'italic'],
  },
]

describe('Markup Translator', () => {
  describe('state value to slate value', () => {
    test('should return correct slate JSON value', () => {
      const _state = slateToState(slateValue, '5d6442046e84d304ddceb768')
      console.log(_state)
      expect(_state).toEqual(stateValue)
      const _slate = stateToSlate(stateValue, '5d6442046e84d304ddceb768')
      expect(_slate).toEqual(slateValue)
    })
  })

  describe('it should add mark to content', () => {
    test('should return correct slate JSON value', () => {
      const _state = slateToState(slateValue, '5d6442046e84d304ddceb768')
      expect(_state).toEqual(stateValue)
      const _slate = stateToSlate(stateValue, '5d6442046e84d304ddceb768')
      expect(_slate).toEqual(slateValue)
    })
  })

  test('change a blocks content value and range', () => {
    const state = reducer(
      initialState,
      setActiveBlockId('5d64424bcfa313f70483c1b0')
    )
    const nextState = reducer(
      state,
      setActiveBlockContent('Another type of entry', {}, ranges)
    )
    const block = entities(
      nextState,
      nextState.blocks[nextState.activeBlockId].type
    )[nextState.blocks[nextState.activeBlockId].refId]
    expect(block.textValue).toEqual('Another type of entry')
    expect(block.ranges).toEqual(ranges)
  })
})
