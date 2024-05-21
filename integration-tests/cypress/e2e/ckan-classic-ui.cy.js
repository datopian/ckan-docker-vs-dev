import {
  createPackageFromUI,
  createResourceFromUI,
  uploadExcelFile,
  uploadPdfFile,
  uploadLargePdfFile,
} from "../support/ckan-classic-ui-tests";

const cypressUpload = require("cypress-file-upload");
const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("CKAN Classic UI", () => {
  beforeEach(function () {
    cy.consentCookies();
    cy.clearCookies();
    cy.login(ckanUserName, ckanUserPassword);
    cy.createOrganization();
  });

  afterEach(function () {
    cy.get("@organizationName").then((orgName) => {
      cy.deleteOrganization(orgName);
    });
  });

  createPackageFromUI();
  createResourceFromUI();
  uploadExcelFile();
  uploadPdfFile();
  uploadLargePdfFile();
});
