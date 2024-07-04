const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

const uuid = () => Math.random().toString(36).slice(2) + "-test";
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const group = `${uuid()}${Cypress.env("GROUP_NAME_SUFFIX")}`;
const dataset = `${uuid()}-test-dataset`;
const reportName = `${uuid()}-report`;
const resourceId = uuid();

describe("Static reference chart", () => {
  before(function () {
    cy.createOrganizationAPI(org);
    cy.createGroupAPI(group);
    cy.createDatasetAPI(org, dataset, {
      resources: [
        {
          format: "CSV",
          name: "diabetes",
          description: "birts",
          id: resourceId,
          url: "https://vital-strategies.l3.ckan.io/dataset/1c2a452f-e64b-41c5-8d7c-a4974f5b6cbc/resource/bc7ed344-e79e-44aa-997a-40905cc54ab2/download/steps_portal_diabetes.csv",
          format: "csv",
        },
      ],
    });
    cy.datastoreSearchAPI(resourceId).then((resourceExists) => {
      cy.log("Resource exists: ", resourceExists);
      if (!resourceExists) {
        cy.datapusherSubmitAPI(resourceId);
      }
    });
    cy.wait(25000);
  });

  beforeEach(function () {
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can create a bar chart", () => {
    cy.viewport(1440, 720);
    cy.visit("/report/new");
    cy.get("input[name=title]").type(reportName);
    cy.get("textarea[name=description]").type("Test Report Description");
    // Open the Select2 dropdown
    cy.get(".select2-container").eq(1).click();
    // get div with role of option and data-value of dataset
    cy.get(`div[role="option"][data-value="${dataset}"]`).click();
    // select <select> tag of id #chart_resource and click on the first option
    cy.get("#chart_resource").select("diabetes");
    cy.get('input[value="Metric"]').click();
    cy.get('input[value="Estimated Population"]').click();
    //get select tag with name of data_filter_name_1 and then select the option inside it with value of Sex
    cy.contains("Add Filter").click();
    cy.get('select[name="data_filter_name_1"]').select("Indicator");
    cy.get('select[name="data_filter_value_1"]').trigger("mousedown");
    cy.wait(2000);
    cy.get('select[name="data_filter_value_1"]').select(2);
    cy.get('input[name="data_filter_alias_1"]').type("Indicator");
    cy.get('button[name="save"]').click({ force: true });
    cy.get("#item_type").select("chart");
    cy.get("#add-visualization-btn").click({ force: true });
    cy.get("#chart_field_graph_1").select("bar");
    cy.get("#chart_field_axis_x_1").select("Answer", { force: true });
    cy.get("#chart_field_category_name_1").select("Demographic Group", {
      force: true,
    });
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    //click on all accordion-button
    cy.get(".accordion-button").eq(3).click();
    cy.get(".accordion-button").eq(4).click();
    cy.get(".accordion-button").eq(5).click();
    cy.get(".accordion-button").eq(6).click();
    cy.get(".accordion-button").eq(7).click();
    cy.get(".accordion-button").eq(8).click();
    cy.get("#chart_field_color_type_1").select("Divergent", { force: true });
    cy.get("#chart_field_color_1_1").invoke("val", "#483d8b", { force: true });
    cy.get("#chart_field_x_text_rotate_1").select("Diagonal", { force: true });
    cy.get("#chart_field_y_label_1").type("Extra title", { force: true });
    cy.get("#chart_field_dynamic_reference_type_1").select("Minimum", {
      force: true,
    });
    cy.get("#chart_field_static_reference_columns_1").select(
      "Metric|National Reference",
      { force: true },
    );
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    cy.wait(5000);
    cy.get('button[name="save"]').click({ force: true });
    cy.visit(`querytool/public/${reportName}`);
    cy.getReportData(reportName)
      .its("body.result.filters")
      .should(
        "equal",
        '[{"order": 1, "name": "Indicator", "value": "Percentage who are currently taking any medication for diabetes prescribed by a health worker", "alias": "Indicator", "visibility": "public"}]',
      );
    cy.getReportData(reportName)
      .its("body.result.sql_string")
      .should(
        "equal",
        `SELECT * FROM \"${resourceId}\" WHERE (\"Indicator\" = 'Percentage who are currently taking any medication for diabetes prescribed by a health worker')`,
      );
    cy.getReportVizData(reportName).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body.result.visualizations).to.eq(
        '[{"type": "chart", "order": 1, "graph": "bar", "x_axis": "Answer", "y_axis": "Metric", "color": null, "color_type": "1", "seq_color": "#feedde,#fdbe85", "title": "", "x_text_rotate": "30", "tooltip_name": null, "data_format": "", "y_tick_format": "", "x_tick_format": "", "padding_bottom": null, "padding_top": null, "tick_count": null, "y_label": "Extra title", "x_label": "", "size": null, "chart_padding_bottom": null, "static_reference_columns": ["Metric|National Reference"], "static_reference_label": "", "dynamic_reference_type": "Minimum", "dynamic_reference_factor": "", "dynamic_reference_label": "", "sort": "default", "additional_description": "", "plotly": "[{\\"x\\":[\\"Age\\",\\"Age by Area\\",\\"Area\\",\\"Sex\\",\\"Sex by Age\\",\\"Sex by Area\\",\\"Total\\"],\\"y\\":[\\"617.78\\",\\"1267.65\\",\\"313.81\\",\\"344.83\\",\\"1267.65\\",\\"626.91\\",\\"186.93\\"],\\"type\\":\\"bar\\",\\"name\\":\\"Under treatment\\",\\"width\\":0.5,\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#483d8b\\"}}]", "line_types": "solid", "line_widths": "4", "bar_width": "0.5", "donut_hole": null, "upper_bounds": "", "lower_bounds": "", "show_bounds": "false", "x_text_multiline": "false", "x_tick_culling_max": null, "show_legend": "true", "show_legend_title": "true", "custom_legend_title": "", "show_annotations": "false", "show_labels": "false", "y_label_hide": "false", "x_label_hide": "false", "show_labels_as_percentages": "false", "y_from_zero": "false", "axis_max": "", "axis_min": "", "axis_range": "false", "x_from_zero": "false", "filter_name": "", "filter_value": "", "filter_alias": "", "filter_visibility": "", "category_name": "Demographic Group", "x_sort_labels": "false"}]',
      );
    });
  });

  after(function () {
    //cy.deleteReport(reportName);
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(group);
    cy.deleteOrganizationAPI(org);
  });
});
