const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

const randomName = () => Math.random().toString(36).slice(2);
const uuid = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .padStart(4, "0");
  };
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
const org = `${randomName()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const group = `${randomName()}${Cypress.env("GROUP_NAME_SUFFIX")}`;
const dataset = `${randomName()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const reportName = `${randomName()}${Cypress.env("REPORT_NAME_SUFFIX")}`;
const resourceCSVId = uuid();
const resourceGeoJSONId = uuid();

describe("Maps", () => {
  before(function () {
    cy.createOrganizationAPI(org);
    cy.createGroupAPI(group);
    cy.createDatasetAPI(org, dataset);
    cy.prepareFile(
      dataset,
      "brasil-gbd17-causas.csv",
      "csv",
      resourceCSVId,
      "Causes",
      "Mortality Causes"
    );
    cy.datastoreSearchAPI(resourceCSVId).then((resourceExists) => {
      cy.log("Resource exists: ", resourceExists);
      if (!resourceExists) {
        cy.datapusherSubmitAPI(resourceCSVId);
      }
    });
    cy.prepareFile(
      dataset,
      "brasil.geojson",
      "geojson",
      resourceGeoJSONId,
      "Causes GeoJSON",
      "Mortality Causes"
    );
    cy.wait(25000);
  });

  beforeEach(function () {
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can create a table", () => {
    cy.viewport(1440, 720);
    cy.visit("/report/new");

    cy.get("input[name=title]").type(reportName);
    cy.get("textarea[name=description]").type("Test Report Description");
    cy.get(".select2-container").eq(1).click();
    cy.get(`div[role="option"][data-value="${dataset}"]`).click();
    cy.get("#chart_resource").select("Causes", { force: true });
    cy.get("input[value='Taxa de mortalidade']").click();
    cy.get("input[value='Número de óbitos']").click();
    cy.get("input[value='Mortalidade proporcional']").click();

    cy.contains("Add Filter").click();

    cy.get("select[name='data_filter_name_1']").select("Causa 1");
    cy.get("select[name='data_filter_value_1']").trigger("mousedown");

    cy.wait(2000);

    cy.get("select[name='data_filter_value_1']").select(2);
    cy.get("input[name='data_filter_alias_1']").type("Causa 1");

    cy.contains("Add Filter").click();

    cy.get("select[name='data_filter_name_2']").select("Causa 2");
    cy.get("select[name='data_filter_value_2']").trigger("mousedown");

    cy.wait(2000);

    cy.get("select[name='data_filter_value_2']").select(1);
    cy.get("input[name='data_filter_alias_2']").type("Causa 2");

    cy.contains("Add Filter").click();

    cy.get("select[name='data_filter_name_3']").select("Causa 3");
    cy.get("select[name='data_filter_value_3']").trigger("mousedown");

    cy.wait(2000);

    cy.get("select[name='data_filter_value_3']").select(1);
    cy.get("input[name='data_filter_alias_3']").type("Causa 3");

    cy.contains("Add Filter").click();

    cy.get("select[name='data_filter_name_4']").select("Sexo");
    cy.get("select[name='data_filter_value_4']").trigger("mousedown");

    cy.wait(2000);

    cy.get("select[name='data_filter_value_4']").select(1);
    cy.get("input[name='data_filter_alias_4']").type("Sex");

    cy.contains("Add Filter").click();

    cy.get("select[name='data_filter_name_5']").select("Idade");
    cy.get("select[name='data_filter_value_5']").trigger("mousedown");

    cy.wait(2000);

    cy.get("select[name='data_filter_value_5']").select(1);
    cy.get("input[name='data_filter_alias_5']").type("Idade");

    cy.get("button[name='save']").click({ force: true });
    cy.get("#item_type").select("map");
    cy.get("#add-visualization-btn").click({ force: true });

    cy.get("#map_custom_title_field_1").type(
      "Test Map Title: {measure|capitalize}",
      { parseSpecialCharSequences: false }
    );
    cy.get("#map_resource_1")
      .find("option")
      .contains("Causes GeoJSON")
      .then(($option) => {
        cy.get("#map_resource_1").select($option.val());
      });
    cy.get("#map_title_field_1").select("Unidade de federação");
    cy.get("#map_key_field_1").select("cartodb_id");
    cy.get("#map_data_key_field_1").select("UF ID");
    cy.get("#map_field_filter_name_1").select("visnal");
    cy.get("#map_field_filter_value_1").trigger("mousedown");
    cy.get("#map_field_filter_value_1").select(2);
    cy.get("#map_field_filter_alias_1").type("Year");

    cy.get("#save-visualization-btn").click({ force: true });
    cy.contains("Visualizations Successfully updated.");
  });

  it("Can view a table on public page", () => {
    cy.visit(`/querytool/public/${reportName}`);
    cy.wait(2000);

    cy.contains("Test Map Title: Taxa de mortalidade");

    cy.get(".legend > :nth-child(1)").should("contain", "748.01 – 823.48");
    cy.get(".legend > :nth-child(2)").should("contain", "823.48 – 898.95");
    cy.get(".legend > :nth-child(3)").should("contain", "898.95 – 974.43");
    cy.get(".legend > :nth-child(4)").should("contain", "974.43 – 1049.90");
    cy.get(".legend > :nth-child(5)").should("contain", "1049.90+");
    cy.get(".legend > :nth-child(6)").should("contain", "No data");

    cy.contains("Causa 1");
    cy.contains("Causa 2");
    cy.contains("Causa 3");
    cy.contains("Todas as causas");
    cy.contains("Sex");
    cy.contains("Ambos");
    cy.contains("Idade");
    cy.contains("Todas as idades (padronizado)");
    cy.contains("Displayed Measure");
    cy.contains("Taxa de mortalidade");
    cy.contains("Year");
    cy.contains("mapa1991");
  });

  it("Filters work on public page", () => {
    cy.visit(`/querytool/public/${reportName}`);
    cy.wait(2000);
    cy.get(".filter-item")
      .contains("label", "Causa 1")
      .parents(".filter-item")
      .within(($el) => {
        cy.wrap($el)
          .find("select[id^='data_filter_value_']")
          .trigger("mousedown")
          .select(2);
      });
    cy.get(".filter-item")
      .contains("label", "Causa 2")
      .parents(".filter-item")
      .within(($el) => {
        cy.wrap($el)
          .find("select[id^='data_filter_value_']")
          .trigger("mousedown")
          .select(1);
      });
    cy.get(".filter-item")
      .contains("label", "Causa 3")
      .parents(".filter-item")
      .within(($el) => {
        cy.wrap($el)
          .find("select[id^='data_filter_value_']")
          .trigger("mousedown")
          .select(1);
      });
    cy.get(".filter-item")
      .contains("label", "Sex")
      .parents(".filter-item")
      .within(($el) => {
        cy.wrap($el)
          .find("select[id^='data_filter_value_']")
          .trigger("mousedown")
          .select(1);
      });
    cy.get(".filter-item")
      .contains("label", "Idade")
      .parents(".filter-item")
      .within(($el) => {
        cy.wrap($el)
          .find("select[id^='data_filter_value_']")
          .trigger("mousedown")
          .select(1);
      });

    cy.get(".btn").contains("Update").click();

    cy.get(".legend > :nth-child(1)").should("contain", "60.70 – 76.32");
    cy.get(".legend > :nth-child(2)").should("contain", "76.32 – 91.93");
    cy.get(".legend > :nth-child(3)").should("contain", "91.93 – 107.55");
    cy.get(".legend > :nth-child(4)").should("contain", "107.55 – 123.16");
    cy.get(".legend > :nth-child(5)").should("contain", "123.16+");
    cy.get(".legend > :nth-child(6)").should("contain", "No data");

    cy.get("select[id^='viz_filter_value_']").trigger("mousedown").select(9);

    cy.get(".legend > :nth-child(1)").should("contain", "55.99 – 69.14");
    cy.get(".legend > :nth-child(2)").should("contain", "69.14 – 82.28");
    cy.get(".legend > :nth-child(3)").should("contain", "82.28 – 95.43");
    cy.get(".legend > :nth-child(4)").should("contain", "95.43 – 108.57");
    cy.get(".legend > :nth-child(5)").should("contain", "108.57+");
    cy.get(".legend > :nth-child(6)").should("contain", "No data");

    cy.get("select[id^='viz_filter_value_']").trigger("mousedown").select(20);

    cy.get(".legend > :nth-child(1)").should("contain", "62.15 – 72.13");
    cy.get(".legend > :nth-child(2)").should("contain", "72.13 – 82.10");
    cy.get(".legend > :nth-child(3)").should("contain", "82.10 – 92.08");
    cy.get(".legend > :nth-child(4)").should("contain", "92.08 – 102.05");
    cy.get(".legend > :nth-child(5)").should("contain", "102.05+");
    cy.get(".legend > :nth-child(6)").should("contain", "No data");
  });

  after(function () {
    cy.deleteReport(reportName);
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(group);
    cy.deleteOrganizationAPI(org);
  });
});
