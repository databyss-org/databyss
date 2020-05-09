// logs in using auth story and returns session JSON

const random = Math.random()
  .toString(36)
  .substring(7)

export const authenticate = () => {
  cy.clearLocalStorage()
  cy.visit('http://localhost:6006/iframe.html?id=services-auth--login')

  cy.get('[data-test-id="googleButton"]')
    .as('googleButton')
    .get('#login-page')
    .as('login')
    .get('[data-test-path="email"]')
    .as('emailInput')
    .get('[data-test-id="continueButton"]')
    .as('continueButton')

  // click "continue with email" enter email
  cy.get('@emailInput')
    .type(`${random}@test.com`)
    .get('@continueButton')
    .click()
    .wait(10000)
    .get('[data-test-path="code"]')
    .as('codeInput')

  // enter pre-defined test code
  cy.get('@codeInput')
    .type('test-code-42')
    .get('@continueButton')
    .click()
    .wait(10000)
    .get('[data-test-session="true"]')
    .invoke('text')
    .as('session')
}
