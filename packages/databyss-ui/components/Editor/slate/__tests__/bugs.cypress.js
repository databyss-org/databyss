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
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('should set initial blocks', () => {
    cy.get('@editor').click()

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY">
            <text />
          </block>
        </document>
      </value>
    )

    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('should trim white space on atomic blocks and allow tabs on entries', () => {
    cy.get('@editor')
      .type('    @source name')
      .newLine()
      .type('\t@second source')
      .newLine()

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">source name</inline>
            <text />
          </block>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">second source</inline>
            <text />
          </block>
          <block type="ENTRY" />
        </document>
      </value>
    )

    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('should highlight atomic block and block format menu', () => {
    cy.get('@editor')
      .type('@Source Name')
      .newLine()
      .previousBlock()
      .setSelection('Source Name')
      .get('[data-test-format-menu="italic"]')
      .click({ force: true })

    cy.once('fail', err => {
      // Capturing the fail event swallows it and lets the test succeed

      // Now look for the expected messages
      expect(err.message).to.include('cy.click() failed because this element')
      expect(err.message).to.include('is being covered by another element')

      done()
    })
  })
})

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

  it('should highlight atomic block and not allow format menu click', () => {
    cy.get('@editor')
      .endOfDoc()
      .previousBlock()
      .endOfLine()
      .newLine()
      .type('{shift}{rightarrow}')
      .type('{backspace}')
      .should('be.visible')

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
          <block type="TOPIC">
            <text />
            <inline type="TOPIC">topic</inline>
            <text />
          </block>
        </document>
      </value>
    )

    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('should delete prevoius block if atomic and backspace clicked', () => {
    cy.get('@editor')
      .nextBlock()
      .startOfLine()
      .type('{backspace}')

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
          <block type="TOPIC">
            <text />
            <inline type="TOPIC">topic</inline>
            <text />
          </block>
        </document>
      </value>
    )

    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })
})
