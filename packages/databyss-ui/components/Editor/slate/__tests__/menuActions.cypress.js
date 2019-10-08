/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'
// import {  } from './../hotKeys'

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

  it('it should open the menu, display actions and select source', () => {
    cy.get('@editor')
      .endOfDoc()
      .newLine()
      .get('[data-test-block-menu-opener]')
      .click()
      .get('[data-test-block-menu-source]')
      .click()
      .get('@editor')
      .type('this should be a source')
      .newLine()

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
          <block type="SOURCE">
            <text>
              <inline type="SOURCE">this should be a source</inline>
            </text>
          </block>
          <block type="ENTRY" />
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('it should open the menu, display actions and select tag', () => {
    cy.get('@editor')
      .endOfDoc()
      .newLine()
      .get('[data-test-block-menu-opener]')
      .click()
      .get('[data-test-block-menu-topic]')
      .click()
      .get('@editor')
      .type('this should be a topic')
      .newLine()

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
          <block type="TOPIC">
            <text>
              <inline type="TOPIC">this should be a topic</inline>
            </text>
          </block>
          <block type="ENTRY" />
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('it should open the menu, display actions and select location', () => {
    cy.get('@editor')
      .endOfDoc()
      .newLine()
      .get('[data-test-block-menu-opener]')
      .click()
      .get('[data-test-block-menu-location]')
      .click()
    cy.get('@editor')
      .focus()
      .type('this whole block should get tagged as a location')
      .newLine()
      .type('{uparrow}')
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
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
          <block type="TOPIC">
            <text />
            <inline type="TOPIC">topic</inline>
            <text />
          </block>
          <block type="LOCATION">
            <mark type="location">
              this whole block should get tagged as a location
            </mark>
          </block>
          <block type="ENTRY" />
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })
})
