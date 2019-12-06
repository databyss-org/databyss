/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'
// import {  } from './../hotKeys'

context('Editor', () => {
  beforeEach(() => {
    cy.visit(
      'http://0.0.0.0:6006/iframe.html?id=editor-slate-implementation--single-line'
    )
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#slateDocument').as('slateDocument')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('should highlight block and delete', () => {
    cy.get('@editor')
      .type('this value should be')
      .toggleItalic()
      .type(' in italics')
      .toggleItalic()
      .type(' ')
      .toggleBold()
      .type('and in bold')

    const expected = toSlateJson(
      <value>
        <document>
          <block type="TEXT">
            {'this value should be'}
            <mark type="italic"> in italics</mark>{' '}
            <mark type="bold">and in bold</mark>
          </block>
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })
})
