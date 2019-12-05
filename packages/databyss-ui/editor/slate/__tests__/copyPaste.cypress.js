/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'
// import {  } from './../hotKeys'

context('Editor', () => {
  beforeEach(() => {
    cy.visit('http://0.0.0.0:6006/iframe.html?id=editor-tests--slate-empty')
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#slateDocument').as('slateDocument')
    cy.get('#pageBlocks').as('pageBlocks')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('should paste text on same line', () => {
    cy.get('@editor')
      .type('this is an example of entry text')
      .endOfLine()
      .type(' ')
      .paste({
        pastePayload: 'pasted content',
        simple: false,
      })
      .wait(1000)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0] }}>
              <text>this is an example of entry text pasted content</text>
            </block>
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should paste text on new line', () => {
    cy.get('@editor')
      .type('this is an example of entry text')
      .newLine()
      .wait(500)
      .paste({
        pastePayload: 'pasted content',
        simple: false,
      })
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0] }}>
              <text>this is an example of entry text</text>
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1] }}>
              <text>pasted content</text>
            </block>
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should not allow paste in atomic block', () => {
    cy.get('@editor')
      .type('@this is an example of source text')
      .newLine()
      .wait(500)
      .previousBlock()
      .paste({
        pastePayload: 'pasted content',
        simple: false,
      })
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0] }}>
              <text />
              <inline type="SOURCE">this is an example of source text</inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1] }} />
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
})
