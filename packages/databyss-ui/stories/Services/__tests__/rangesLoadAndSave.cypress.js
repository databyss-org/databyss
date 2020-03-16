/** @jsx h */
import h from 'slate-hyperscript'

import { authenticate } from './_helpers'
import {
  toSlateJson,
  matchExpectedJson,
} from '@databyss-org/ui/editor/slate/__tests__/_helpers'

context('Editor - Sources Provider', () => {
  beforeEach(() => {
    authenticate()
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-page--slate-load-and-save'
    )
    cy.wait(4000)

    cy.get('[contenteditable="true"]').as('editor')
    cy.get('#slateDocument').as('slateDocument')
    cy.get('#pageBlocks').as('pageBlocks')
  })

  it('Loads and saves ranges', () => {
    cy.get('@editor')
      .nextBlock()
      .setSelection('On')
      .toggleBold()
      .setSelection('assertion')
      .toggleItalic()
      .setSelection('limitation')
      .toggleLocation()

    // wait for autosave
    cy.wait(11000)

    // reload the page
    cy.reload().wait(2000)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">
                Stamenov, Language Structure, Discourse and the Access to
                Consciousness
              </inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }}>
              <mark type="bold">On</mark>
              {' the '}
              <mark type="location">limitation</mark>
              {' of third-order thought to '}
              <mark type="italic">assertion</mark>
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
})
