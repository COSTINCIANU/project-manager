import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://project-manager.costincianu.fr",
    setupNodeEvents(on, config) {},
  },
});

//  config en local
// import { defineConfig } from "cypress";

// export default defineConfig({
//   e2e: {
//     baseUrl: "http://localhost:5173",
//     env: {
//       apiUrl: "http://localhost:8000",
//     },
//   },
// });
