const ckanUserName = Cypress.env('CKAN_USERNAME')
const ckanUserPassword = Cypress.env('CKAN_PASSWORD')

Cypress.on('uncaught:exception', (err, runnable) => {
  console.log(err);
  return false;
})

describe('Listing of reports', () => {
  beforeEach(function () {
    cy.consentCookies()
    cy.login(ckanUserName, ckanUserPassword)
  })

  it('Can list reports', () => {
    cy.viewport(1440, 720)
    cy.visit('/report')
    cy.contains('Reports')
    cy.contains('New Report')
    cy.contains('Search reports')
    cy.contains('SCDC')
    cy.get('#field-giant-search').type('Main Causes of Death')
    cy.get('button[value="search"]').click({ force: true})
    cy.contains('1 report found for "Main Causes of Death"')
  })
})
