/** @jsx h */

/* eslint-disable func-names */

import { _seedValue1, _seedValue2 } from './initialValue'

context('Editor', () => {
  beforeEach(() => {
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-auth--login-accounts'
    )
    cy.clearLocalStorage()
    cy.get('button').click()
    cy.wait(4000)
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-atomic-blocks--edit-atomic-blocks'
    ).focus()
    cy.wait(1000)
    cy.get('button').then(buttonList => {
      buttonList[0].click()
      cy.wait(2000)
      cy.reload()
      cy.wait(2000)
      cy.get('button').then(buttonList => {
        buttonList[1].click()
        cy.wait(2000)
        cy.get('[contenteditable="true"]')
          .as('editor')
          .focus()
        cy.get('#slateDocument').as('slateDocument')
      })
    })
  })

  //   it('renders the contenteditable container', () => {
  //     cy.get('@editor').should('have.attr', 'role')
  //   })

  it('Edits atomic sources', () => {
    cy.get('@editor')
      .focus()
      .get('[data-test-atomic-edit="open"]')
      .click()
    cy.get('#citation').as('citation')
    cy.get('#firstName').as('firstName')
    cy.get('#lastName').as('lastName')
    cy.get('#name').as('name')
    cy.get('@name')
      .focus()
      .get('[contenteditable="true"]')
      .then(content => content[1].click())
  })
})
