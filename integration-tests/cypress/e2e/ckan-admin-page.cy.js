const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("Admin Config Options", () => {
  beforeEach(function () {
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can view admin page", () => {
    cy.visit("/");
    cy.get(".account > .list-unstyled > :nth-child(1) > a").click();
    cy.get(".page-header > .nav > :nth-child(2) > a").click();

    // Reset changes to default
    cy.get(".form-actions > .btn-danger").click({ force: true });
    cy.get(".modal-footer > .btn-primary").click({ force: true });

    cy.get("#custom-theme").should("not.be.visible");
    cy.get("#querytool_theme").should("exist");
    cy.get("#querytool_theme").select("Custom");
    cy.get("#custom-theme").should("be.visible");

    // Image uploads
    const sourceFile = { fileName: "image.png", fileType: "image/png" };
    const fields = [
      { fieldName: "header_image_upload" },
      { fieldName: "footer_logo_image_upload" },
      { fieldName: "footer_logo2_image_upload" },
    ];

    fields.forEach((field) => {
      cy.get(`input[name="${field.fieldName}"]`).attachFile({
        filePath: sourceFile.fileName,
        mimeType: sourceFile.fileType,
        fileName: `${field.fieldName}.png`,
      });
    });

    fields.forEach((field) => {
      cy.get(`input[name="${field.fieldName}"]`).should(
        "have.value",
        `C:\\fakepath\\${field.fieldName}.png`
      );
    });

    // Text color
    const colorValue = "#fffff5";

    cy.get('input[name="header_text_color"]')
      .invoke("val", colorValue)
      .trigger("change");

    cy.get('input[name="header_text_color"]').should("have.value", colorValue);

    // Text
    const textFields = {
      title: "Welcome Page Title Cypress",
      description: "Welcome Page Description Cypress",
      footer_logo_text: "Footer Logo Text Cypress",
      footer_logo2_text: "Footer Logo2 Text Cypress",
      copyright_text: "Copyright Text Cypress",
    };
    cy.get("#field-ckan\\.welcome_page_title").type(textFields.title);
    cy.get("#field-ckan\\.welcome_page_description").type(
      textFields.description
    );
    cy.get("#field-footer-logo-text").type(textFields.footer_logo_text);
    cy.get("#field-footer-logo2-text").type(textFields.footer_logo2_text);
    cy.get("#field-copyright_text").type(textFields.copyright_text);

    // Social Media Links
    const socialMediaLinks = ["facebook", "twitter", "youtube", "whatsapp"];

    socialMediaLinks.forEach((link) => {
      cy.get(`#${link}`).drag("#column-social-selected", {
        force: true,
        target: {
          position: "bottom",
        },
      });
      cy.get(`#field-${link}-url`)
        .should("be.visible")
        .clear()
        .type(`https://${link}.com`);
    });

    // Save changes
    cy.get(".btn-primary").click({ force: true });

    // Confirm changes
    cy.visit("/");

    cy.get("#header-wrapper")
      .should("have.css", "background-image")
      .and("include", "headerimageupload.png");
    cy.get("#header-text")
      .should("have.css", "color")
      .and("eq", "rgb(255, 255, 245)");
    cy.get("#header-title").should("have.text", textFields.title);
    cy.get(".long-desc").should("include.text", textFields.description);
    cy.get(".custom-footer > :nth-child(1) > img")
      .should("have.attr", "src")
      .and("include", "footerlogoimageupload.png");
    cy.get(".custom-footer > :nth-child(1) > div > p").should(
      "have.text",
      textFields.footer_logo_text
    );
    cy.get(".custom-footer > :nth-child(2) > img")
      .should("have.attr", "src")
      .and("include", "footerlogo2imageupload.png");
    cy.get(".custom-footer > :nth-child(2) > div > p").should(
      "have.text",
      textFields.footer_logo2_text
    );
    cy.get(".copyright > p").should("have.text", textFields.copyright_text);

    for (let link of socialMediaLinks) {
      cy.get(`[href="https://${link}.com"] > img`).should("exist");
    }

    // Reset changes
    cy.get(".account > .list-unstyled > :nth-child(1) > a").click();
    cy.get(".page-header > .nav > :nth-child(2) > a").click();
    cy.get(".form-actions > .btn-danger").click({ force: true });
    cy.get(".modal-footer > .btn-primary").click({ force: true });
  });
});
