/** @jsx jsx */
/* eslint-disable func-names */

import { jsx } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'

context('Editor Slate V2', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=cypress-tests--slate-5')

    cy.get('[contenteditable="true"]')
      .click()
      .as('editor')

    cy.get('#slateDocument').as('slateDocument')
    cy.get('#pageDocument').as('pageDocument')
  })

  // it('renders the contenteditable container', () => {
  //   cy.get('@editor').should('have.attr', 'role')
  // })

  it('should input an entry, source and topic', () => {
    cy.wait(200)
      .getEditor('[contenteditable="true"]')
      .typeInSlate('Some input text ')
      .linebreak()
      .typeInSlate('@this is a source text')
      .linebreak()
      .typeInSlate('this is a topic text')
      .linebreak()
      .wait(500)

    const expected = (
      <editor>
        <block type="ENTRY">Some input text </block>
        <block type="SOURCE">this is a source text</block>
        <block type="ENTRY">this is a topic text</block>
        <block type="ENTRY">
          <cursor />
        </block>
      </editor>
    )

    cy.get('@slateDocument').then(slateDoc => {
      const editor = JSON.parse(slateDoc.text())
      assert.deepEqual(
        sanitizeEditorChildren(editor.children),
        sanitizeEditorChildren(expected.children)
      )
      assert.deepEqual(editor.selection, expected.selection)
    })
  })
})
