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
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).padStart(4, '0');
  };
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
const org = `${randomName()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const group = `${randomName()}${Cypress.env("GROUP_NAME_SUFFIX")}`;
const dataset = `${randomName()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const reportName = `${randomName()}${Cypress.env("REPORT_NAME_SUFFIX")}`;
const resourceId = uuid();

describe("Line chart", () => {
  before(function () {
    cy.createOrganizationAPI(org);
    cy.createGroupAPI(group);
    cy.createDatasetAPI(org, dataset);
    cy.prepareFile(dataset, "births_08_17_table_mex.csv", "csv", resourceId, "birth tests", "births");
    cy.datastoreSearchAPI(resourceId).then((resourceExists) => {
      cy.log("Resource exists: ", resourceExists);
      if (!resourceExists) {
        cy.datapusherSubmitAPI(resourceId);
      }
    });
    cy.wait(25000)
  });

  beforeEach(function () {
    cy.consentCookies();
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Can create a line chart", () => {
    cy.viewport(1440, 720);
    cy.visit("/report/new");
    cy.get("input[name=title]").type(reportName);
    cy.get("textarea[name=description]").type("Test Report Description");
    // Open the Select2 dropdown
    cy.get(".select2-container").eq(1).click();
    // get div with role of option and data-value of dataset
    cy.get(`div[role="option"][data-value="${dataset}"]`).click();
    // select <select> tag of id #chart_resource and click on the first option
    cy.get("#chart_resource").select("birth tests", { force: true });
    cy.get('input[value="Count"]').click();
    //get select tag with name of data_filter_name_1 and then select the option inside it with value of Sex
    cy.contains("Add Filter").click();
    cy.get('select[name="data_filter_name_1"]').select("Education Level");
    cy.get('select[name="data_filter_value_1"]').trigger("mousedown");
    cy.wait(2000);
    cy.get('select[name="data_filter_value_1"]').select(5);
    cy.get('input[name="data_filter_alias_1"]').type("Test");
    cy.get('button[name="save"]').click({ force: true });
    cy.get("#item_type").select("chart");
    cy.get("#add-visualization-btn").click({ force: true });
    cy.get("#chart_field_axis_x_1").select("Age Group");
    cy.get("#chart_field_category_name_1").select("Year");
    cy.get("#chart_field_title_1").type(
      "DESCRIPTION OF LINE CHART Adding variable here ",
    );
    cy.get(".title-vars select").select("{measure|capitalize}");
    cy.get("#chart_field_desc_1").type(
      "ADDITIONAL DESCRIPTION OF LINE CHART Adding variable here ",
    );
    cy.get(".desc-vars select").select("{test|capitalize}");
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    cy.get(".accordion-button").eq(3).click();
    cy.get(".accordion-button").eq(4).click();
    cy.get(".accordion-button").eq(5).click();
    cy.get("#chart_field_line_type_1_1").select("Dashed", { force: true });
    cy.get("#chart_field_line_type_1_2").select("Dash Dot", { force: true });
    cy.get("#chart_field_line_type_1_5").select("Dotted", { force: true });
    cy.get("#chart_field_color_1_1").invoke("val", "#ee00ee", { force: true });
    cy.get("#chart_field_color_1_2").invoke("val", "#00eeee", { force: true });
    cy.get("#chart_field_color_1_5").invoke("val", "#00ee00", { force: true });
    cy.get("#chart_field_x_label_1").type("Extra title");
    //click on all accordion-button
    cy.get(".x-title-vars select").select("{measure|capitalize}");
    cy.get("#chart_field_x_text_rotate_1").select("Diagonal", { force: true });
    cy.get("#chart_field_y_label_1").type("Extra title", { force: true });
    cy.get(".y-title-vars select").select("{measure|capitalize}", {
      force: true,
    });
    cy.get("#chart_field_sort_1").select("Ascending", { force: true });
    cy.get("#chart_field_dynamic_reference_type_1").select("Average", {
      force: true,
    });
    cy.get("#chart_field_dynamic_reference_factor_1").type(1.5, {
      force: true,
    });
    cy.get(".chart-actions").eq(0).get(".update-chart-btn").click();
    cy.get("#item_type").select("text-box");
    cy.get("#add-visualization-btn").click({ force: true });
    cy.get("#text_box_description_1").type(
      "DESCRIPTION TEXT BOX Adding variable here ",
    );
    cy.get(".title-vars select").eq(1).select("{measure|capitalize}");
    cy.get('button[name="save"]').click({ force: true });
    cy.visit(`querytool/public/${reportName}`);
    cy.contains("DESCRIPTION OF LINE CHART Adding variable hereCountCount");
    cy.contains(
      "ADDITIONAL DESCRIPTION OF LINE CHART Adding variable hereAll levels",
    );
    cy.contains("DESCRIPTION TEXT BOX Adding variable here ");
    cy.getReportData(reportName)
      .its("body.result.filters")
      .should(
        "equal",
        '[{"order": 1, "name": "Education Level", "value": "All levels", "alias": "Test", "visibility": "public"}]',
      );
    cy.getReportData(reportName)
      .its("body.result.sql_string")
      .should(
        "equal",
        `SELECT * FROM "${resourceId}" WHERE ("Education Level" = \'All levels\')`,
      );
    cy.getReportVizData(reportName).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body.result.visualizations).to.eq(
        '[{"type": "chart", "order": 2, "graph": "line", "x_axis": "Age Group", "y_axis": "Count", "color": null, "color_type": "1", "seq_color": "#feedde,#fdbe85", "title": "DESCRIPTION OF LINE CHART Adding variable here{measure|capitalize}{measure|capitalize}", "x_text_rotate": "30", "tooltip_name": null, "data_format": "", "y_tick_format": "", "x_tick_format": "", "padding_bottom": null, "padding_top": null, "tick_count": null, "y_label": "Extra title{measure|capitalize}", "x_label": "Extra title{measure|capitalize}", "size": null, "chart_padding_bottom": null, "static_reference_columns": [], "static_reference_label": "", "dynamic_reference_type": "Average", "dynamic_reference_factor": "1.5", "dynamic_reference_label": "", "sort": "asc", "additional_description": "ADDITIONAL DESCRIPTION OF LINE CHART Adding variable here{test|capitalize}", "plotly": "[{\\"x\\":[\\"2008\\",\\"2009\\",\\"2010\\",\\"2011\\",\\"2012\\",\\"2013\\",\\"2014\\",\\"2015\\",\\"2016\\",\\"2017\\"],\\"y\\":[\\"46452\\",\\"53594\\",\\"146568\\",\\"242686\\",\\"246618\\",\\"44568\\",\\"236288\\",\\"218472\\",\\"198388\\",\\"200494\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"46452\\",\\"53594\\",\\"146568\\",\\"242686\\",\\"246618\\",\\"44568\\",\\"236288\\",\\"218472\\",\\"198388\\",\\"200494\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\" <15\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"dash\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#ee00ee\\"}},{\\"x\\":[\\"2008\\",\\"2009\\",\\"2010\\",\\"2011\\",\\"2012\\",\\"2013\\",\\"2014\\",\\"2015\\",\\"2016\\",\\"2017\\"],\\"y\\":[\\"1019454\\",\\"1067840\\",\\"1446726\\",\\"1998638\\",\\"2045778\\",\\"1149836\\",\\"1980036\\",\\"1873012\\",\\"1781920\\",\\"1790226\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"1019454\\",\\"1067840\\",\\"1446726\\",\\"1998638\\",\\"2045778\\",\\"1149836\\",\\"1980036\\",\\"1873012\\",\\"1781920\\",\\"1790226\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"16-19\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"dashdot\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#00eeee\\"}},{\\"x\\":[\\"2008\\",\\"2009\\",\\"2010\\",\\"2011\\",\\"2012\\",\\"2013\\",\\"2014\\",\\"2015\\",\\"2016\\",\\"2017\\"],\\"y\\":[\\"5127788\\",\\"5255830\\",\\"5148574\\",\\"5952702\\",\\"6092772\\",\\"5699960\\",\\"6078754\\",\\"6016384\\",\\"5849362\\",\\"5766052\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"5127788\\",\\"5255830\\",\\"5148574\\",\\"5952702\\",\\"6092772\\",\\"5699960\\",\\"6078754\\",\\"6016384\\",\\"5849362\\",\\"5766052\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"20-29\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"solid\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#8fbc8f\\"}},{\\"x\\":[\\"2008\\",\\"2009\\",\\"2010\\",\\"2011\\",\\"2012\\",\\"2013\\",\\"2014\\",\\"2015\\",\\"2016\\",\\"2017\\"],\\"y\\":[\\"2591750\\",\\"2644350\\",\\"2335278\\",\\"2732060\\",\\"2764318\\",\\"2813952\\",\\"2782558\\",\\"2773348\\",\\"2746888\\",\\"2758246\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"2591750\\",\\"2644350\\",\\"2335278\\",\\"2732060\\",\\"2764318\\",\\"2813952\\",\\"2782558\\",\\"2773348\\",\\"2746888\\",\\"2758246\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"30-39\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"solid\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#8fbc8f\\"}},{\\"x\\":[\\"2008\\",\\"2009\\",\\"2010\\",\\"2011\\",\\"2012\\",\\"2013\\",\\"2014\\",\\"2015\\",\\"2016\\",\\"2017\\"],\\"y\\":[\\"223610\\",\\"232546\\",\\"153374\\",\\"213748\\",\\"223350\\",\\"279556\\",\\"236588\\",\\"233848\\",\\"230952\\",\\"232358\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"223610\\",\\"232546\\",\\"153374\\",\\"213748\\",\\"223350\\",\\"279556\\",\\"236588\\",\\"233848\\",\\"230952\\",\\"232358\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"40+\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"dot\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#00ee00\\"}},{\\"x\\":[\\"2008\\",\\"2009\\",\\"2010\\",\\"2011\\",\\"2012\\",\\"2013\\",\\"2014\\",\\"2015\\",\\"2016\\",\\"2017\\"],\\"y\\":[\\"32134546\\",\\"33132248\\",\\"33537136\\",\\"33577488\\",\\"34263372\\",\\"35589672\\",\\"33996918\\",\\"33373644\\",\\"32437818\\",\\"32256498\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"32134546\\",\\"33132248\\",\\"33537136\\",\\"33577488\\",\\"34263372\\",\\"35589672\\",\\"33996918\\",\\"33373644\\",\\"32437818\\",\\"32256498\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"All ages\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"solid\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#8fbc8f\\"}},{\\"x\\":[\\"2008\\",\\"2009\\",\\"2010\\",\\"2011\\",\\"2012\\",\\"2013\\",\\"2014\\",\\"2015\\",\\"2016\\",\\"2017\\"],\\"y\\":[\\"52662\\",\\"48288\\",\\"18082\\",\\"9484\\",\\"5096\\",\\"4790\\"],\\"type\\":\\"scatter\\",\\"mode\\":\\"lines+markers\\",\\"text\\":[\\"52662\\",\\"48288\\",\\"18082\\",\\"9484\\",\\"5096\\",\\"4790\\"],\\"textposition\\":\\"top center\\",\\"textfont\\":{\\"size\\":14},\\"name\\":\\"Unknown\\",\\"line\\":{\\"width\\":\\"4\\",\\"dash\\":\\"solid\\"},\\"hovertemplate\\":\\"%{y}<extra></extra>\\",\\"error_y\\":{},\\"error_x\\":{},\\"marker\\":{\\"color\\":\\"#8fbc8f\\"}}]", "line_types": "dash,dashdot,solid,solid,dot,solid,solid", "line_widths": "4,4,4,4,4,4,4", "bar_width": null, "donut_hole": null, "upper_bounds": "", "lower_bounds": "", "show_bounds": "false", "x_text_multiline": "false", "x_tick_culling_max": "", "show_legend": "true", "show_legend_title": "true", "custom_legend_title": "", "show_annotations": "false", "show_labels": "false", "y_label_hide": "false", "x_label_hide": "false", "show_labels_as_percentages": "false", "y_from_zero": "false", "axis_max": null, "axis_min": null, "axis_range": "false", "x_from_zero": "false", "filter_name": "", "filter_value": "", "filter_alias": "", "filter_visibility": "", "category_name": "Year", "x_sort_labels": "false"}, {"type": "text_box", "order": 1, "description": "DESCRIPTION TEXT BOX Adding variable here", "column_width": "Half"}]',
      );
    });
  });

  after(function () {
    cy.deleteReport(reportName);
    cy.deleteDatasetAPI(dataset)
    cy.deleteGroupAPI(group);
    cy.deleteOrganizationAPI(org);
  });
});
