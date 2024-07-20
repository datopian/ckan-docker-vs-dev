const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("Seed Command", () => {
  beforeEach(function () {
    cy.viewport(1440, 720);
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can seed CKAN Organization", () => {
    cy.visit("/organization");

    cy.contains(
      "WHO STEPwise approach to noncommunicable disease (NCD) risk factor surveillance."
    ).then((el) => {
      cy.get(el).parent().contains("9 Datasets");
    });
  });

  it("Can seed CKAN Groups", () => {
    cy.visit("/group");

    cy.contains("Alcohol Consumption").then((el) => {
      cy.get(el)
        .parent()
        .contains(
          "Information on current and previous alcohol consumption, frequency and..."
        );
      cy.get(el).parent().contains("1 Dataset");
    });

    cy.contains("Diet").then((el) => {
      cy.get(el)
        .parent()
        .contains(
          "Information on fruit and vegetable consumption and servings, use of oil or..."
        );
      cy.get(el).parent().contains("1 Dataset");
    });

    cy.contains("Physical activity").then((el) => {
      cy.get(el)
        .parent()
        .contains(
          "Information on the level of physical activity of survey participants and the..."
        );
      cy.get(el).parent().contains("1 Dataset");
    });
  });

  it("Can seed CKAN datasets and resources", () => {
    cy.visit("/organization/steps-survey");

    cy.contains("9 datasets found");
    cy.get(".dataset-heading").contains("Physical Activity").click();
    cy.contains("STEPS Physical Activity Data").click();

    cy.wait(2000);

    cy.get("iframe")
      .its("0.contentDocument.body")
      .then(cy.wrap)
      .find("span.doc-count")
      .contains("1000");

    cy.get("iframe")
      .its("0.contentDocument.body")
      .should(
        "contain.text",
        "Percentage not meeting WHO recommendations on physical activity"
      )
      .and("contain.text", "Not meeting WHO recommendations")
      .and("contain.text", "Total")
      .and("contain.text", "2015")
      .and("contain.text", "Estimated")
      .and("contain.text", "41.86")
      .and("contain.text", "51734638");

    cy.visit("/organization/steps-survey");

    cy.get(".dataset-heading").contains("Diabetes").click();
    cy.contains("STEPS Diabetes Data").click();

    cy.wait(2000);

    cy.get("iframe")
      .its("0.contentDocument.body")
      .then(cy.wrap)
      .find("span.doc-count")
      .contains("2000");

    cy.get("iframe")
      .its("0.contentDocument.body")
      .should("contain.text", "Percentage who had their blood glucose measured")
      .and("contain.text", "Never measured")
      .and("contain.text", "Total")
      .and("contain.text", "2010")
      .and("contain.text", "Estimated")
      .and("contain.text", "14.96")
      .and("contain.text", "18489015");
  });

  it("Can seed Querytool reports", () => {
    cy.visit("/report");

    cy.get("#field-giant-search")
      .type("Cholesterol data by demographics")
      .type("{enter}");
    cy.contains("1 report found");

    cy.get("#field-giant-search").clear();
    cy.get("#field-giant-search")
      .type("Diet data by demographics")
      .type("{enter}");
    cy.contains("1 report found");

    cy.get("#field-giant-search").clear();
    cy.get("#field-giant-search")
      .type("Physical activity data by demographics")
      .type("{enter}");
    cy.contains("1 report found");

    cy.get("#field-giant-search").clear();
    cy.get("#field-giant-search")
      .type("Alcohol consumption data by demographics")
      .type("{enter}");
    cy.contains("1 report found");
  });

  it("Can seed Querytool visualizations", () => {
    cy.visit("/report");

    cy.get("#field-giant-search")
      .type("Cholesterol data by demographics")
      .type("{enter}");

    cy.get(".btn").contains("View").click();

    cy.contains("Cholesterol data by demographics");
    cy.contains(
      "A selected indicator on cholesterol levels is compared across all different demographic groups. For example:"
    );
    cy.contains(
      "What percentage of participants are on treatment for raised cholesterol across sex, age and location (urban versus rural)?"
    );

    cy.get(".plot-container.plotly").should("exist");
    cy.get(".viz-container").find(".item").should("have.length", 8);

    cy.contains("Percentage who had their cholesterol measured by sex");
    cy.contains("Demographic Characteristic");
    cy.contains(
      "The indicator value and confidence intervals are presented in the following table."
    );
    cy.contains(
      "Percentage who had their cholesterol measured , estimate and confidence intervals"
    );

    cy.get("table tbody")
      .find("tr")
      .first()
      .within(() => {
        cy.get("td").eq(0).should("contain.text", "Men - Measured");
        cy.get("td").eq(1).should("contain.text", "75.5");
        cy.get("td").eq(2).should("contain.text", "72.9");
        cy.get("td").eq(3).should("contain.text", "78.1");
      });

    cy.contains(
      "Percentage who had their cholesterol measured by age group"
    ).then((el) => {
      cy.get(el).parent().contains("18-69");
      cy.get(el).parent().contains("18-29");
      cy.get(el).parent().contains("30-49");
      cy.get(el).parent().contains("50-69");
    });

    cy.contains(
      "Percentage who had their cholesterol measured for all demographic groups"
    ).then((el) => {
      cy.get(el)
        .parent()
        .find("table tbody")
        .find("tr")
        .first()
        .within(() => {
          cy.get("td").eq(0).should("contain.text", "18-29");
          cy.get("td").eq(1).should("contain.text", "80.9");
          cy.get("td").eq(2).should("contain.text", "19.1");
        });
    });
  });
});
