/** @jsx h */

/* eslint-disable func-names */

import { matchWithoutId } from './_helpers'

const expected = {
  authors: [
    {
      firstName: { textValue: 'first name of source' },
      lastName: { textValue: 'last name of source' },
    },
  ],
  text: {
    textValue: 'name of citation',
    ranges: [],
  },
  citations: [
    {
      textValue: 'long form of citation',
      ranges: [],
    },
  ],
}

context('Editor', () => {
  beforeEach(() => {
    cy.visit(
      'http://localhost:6006/iframe.html?id=editor-tests--valuelist-controller'
    )
    cy.get('#citation').as('citation')
    cy.get('#firstName').as('firstName')
    cy.get('#lastName').as('lastName')
    cy.get('#name').as('name')
    cy.get('#formDocuments').as('slateDocument')
  })

  it('renders the contenteditable container', () => {
    cy.get('@citation').should('have.attr', 'role')
  })

  it('should type the correct values in valueList', () => {
    cy.get('@name').type('name of citation')
    cy.get('@firstName')
      .focus()
      .type('first name of source')
    cy.get('@lastName')
      .focus()
      .type('last name of source')
    cy.get('@citation')
      .focus()
      .type('long form of citation')

    cy.get('@slateDocument').then(matchWithoutId(expected))
  })
})
