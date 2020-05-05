/* eslint-disable func-names */
import React from 'react'
import { matchExpectedJson } from './__helpers'

context('Editor Slate V2', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=cypress-tests--slate-5')

    cy.get('[contenteditable="true"]')
      .click()
      .as('editor')

    cy.get('#slateDocument').as('slateDocument')
    cy.get('#pageDocument').as('pageDocument')
    cy.get('#jsxDocument').as('jsxDocument')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('should input an entry, source and topic', () => {
    cy.wait(200)
      .getEditor('[contenteditable="true"]')
      .typeInSlate('Some input text ')
      .linebreak()
      .typeInSlate('@this is a source text')
      .linebreak()
      .typeInSlate('#this is a topic text')
      .type('{uparrow}')
      .wait(500)

    const expected = (
      <body>
        <entity type="ENTRY">Some input text </entity>
        <entity type="SOURCE">this is a source text</entity>
        <entity type="TOPIC">this is a topic text</entity>
      </body>
    )

    cy.get('@jsxDocument').then(jsxDoc => {
      matchExpectedJson(expected, jsxDoc.text())
    })
  })
})
