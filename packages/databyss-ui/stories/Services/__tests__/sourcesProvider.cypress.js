/** @jsx h */

/* eslint-disable func-names */

import { _seedValue1, _seedValue2 } from './initialValue'

context('Editor', () => {
  beforeEach(() => {
    cy.clearLocalStorage()

    cy.visit(
      'http://localhost:6006/iframe.html?id=services-auth--login-accounts'
    )

    //  cy.get('button').click()
    cy.wait(1000)
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-sources--load-and-save-sources'
    )
    cy.get('#currentSource').as('source')
  })

  it('renders the contenteditable container', () => {
    cy.get('button').then(buttonList => {
      const getSource1 = buttonList[0]
      const getSource2 = buttonList[1]
      const setSource1 = buttonList[2]
      const setSource2 = buttonList[3]
      setSource1.click()
      cy.wait(2000)
      setSource2.click()
      cy.wait(2000)
      getSource1.click()
      cy.get('@source')
        .invoke('text')
        .then(source => {
          expect(source).to.eq(_seedValue1.citations[0].textValue)

          getSource2.click()
          cy.get('@source')
            .invoke('text')
            .then(source =>
              expect(source).to.eq(_seedValue2.citations[0].textValue)
            )
        })
    })
  })
})
