/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'

context('Editor', () => {
  beforeEach(() => {
    cy.visit('http://0.0.0.0:6006/iframe.html?id=editor-tests--slate')
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#slateDocument').as('slateDocument')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('should set initial blocks and inlines', () => {
    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              Stamenov, Language Structure, Discourse and the Access to
              Consciousness
            </inline>
            <text />
          </block>
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('should set @ block to SOURCE on blur', () => {
    cy.get('@editor')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{home}')
      .type('@')
      .type('{uparrow}')

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              Stamenov, Language Structure, Discourse and the Access to
              Consciousness
            </inline>
            <text />
          </block>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              On the limitation of third-order thought to assertion
            </inline>
            <text />
          </block>
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })
})
