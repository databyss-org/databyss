/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'
// import {  } from './../hotKeys'

context('Editor', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=cypress-tests--slate-empty')
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#slateDocument').as('slateDocument')
    cy.get('#pageBlocks').as('pageBlocks')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('it should open the menu, display actions and select source', () => {
    cy.get('@editor')
      .focus()
      .get('[data-test-block-menu="open"]')
      .click()
      .get('[data-test-block-menu="SOURCE"]')
      .click()
      .get('@editor')
      .type('this should be a source')
      .newLine()
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0] }}>
              <text>
                <inline type="SOURCE">this should be a source</inline>
              </text>
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1] }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('it should open the menu, display actions and select tag', () => {
    cy.get('@editor')
      .get('[data-test-block-menu="open"]')
      .click()
      .get('[data-test-block-menu="TOPIC"]')
      .click()
      .get('@editor')
      .type('this should be a topic')
      .newLine()
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="TOPIC" data={{ refId: refIdList[0] }}>
              <text>
                <inline type="TOPIC">this should be a topic</inline>
              </text>
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1] }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('it should open the menu, display actions and select location', () => {
    cy.get('@editor')
      .focus()
      .get('[data-test-block-menu="open"]')
      .click()
      .get('[data-test-block-menu="LOCATION"]')
      .trigger('mousedown')
    cy.get('@editor')
      .type('this whole block should get tagged as a location')
      .newLine()
      .type('{uparrow}')
      .type('{uparrow}')
    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="LOCATION" data={{ refId: refIdList[0] }}>
              <mark type="location">
                this whole block should get tagged as a location
              </mark>
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1] }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
  it('only appear when the proceeding line is blank', () => {
    cy.get('@editor')
      .focus()
      .get('[data-test-block-menu="open"]')
      .click()
    cy.get('@editor')
      .type('test')
      .get('[data-test-block-menu="open"]')
      .should('not.be.visible')
    cy.get('@editor')
      .newLine()
      .get('[data-test-block-menu="open"]')
      .click()
      .get('[data-test-block-menu="TOPIC"]')
      .should('be.visible')
  })

  // TODO: needs to add padding top
  it('it should highlight a selection and toggle bold/italic on the marks', () => {
    cy.get('@editor')
      .type('On the limitation of third-order thought to assertion')
      .setSelection('limitation')
      .get('[data-test-format-menu="italic"]')
      .click()
    cy.get('@editor')
      .setSelection('order')
      .get('[data-test-format-menu="bold"]')
      .click()

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0] }}>
              {'On the '}
              <mark type="italic">limitation</mark>
              {' of third-'}
              <mark type="bold">order</mark>
              {' thought to assertion'}
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
})
