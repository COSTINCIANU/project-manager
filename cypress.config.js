import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://project-manager.costincianu.fr",
    setupNodeEvents(on, config) {},
  },
});
