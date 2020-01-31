export const authenticate = () => {
  cy.visit('http://localhost:6006/iframe.html?id=services-auth--login')
  cy.get('[data-test-id="googleButton"]').as('googleButton')
  cy.get('[data-test-id="emailButton"]').as('emailButton')

  cy.get('@emailButton')
    .click()
    .get('[data-test-path="email"]')
    .as('emailInput')
    .get('[data-test-id="continueButton"]')
    .as('continueButton')

  // click "continue with email" enter email
  cy.get('@emailInput')
    .type('email@test.com')
    .get('@continueButton')
    .click()
    .get('[data-test-path="code"]')
    .as('codeInput')

  // enter pre-defined test code
  cy.get('@codeInput')
    .type('test-code-42')
    .get('@continueButton')
    .click()
  cy.wait(4000)
}
