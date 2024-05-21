import cypress from "cypress";
import path from "path";
import { CKANIntegrationTests } from "ckan-integration-tests";

const assets = new CKANIntegrationTests();

const fixturesDir = path.resolve("cypress/fixtures");
const supportFile = path.resolve("cypress/support/e2e.js");
const specs = "**/*.cy.js";

assets.options.config = {
  fixturesFolder: fixturesDir,
  supportFile: supportFile,
};
assets.options.spec = specs;

console.log(`Running tests with options: ${JSON.stringify(assets.options, null, 2)}`);

cypress
  .run(assets.options)
  .then(console.log)
  .catch(console.error)
  .finally(() => assets.cleanUp());
