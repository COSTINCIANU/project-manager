// =====================================================
// commands.js — Commandes Cypress personnalisées
// =====================================================

// cy.login() — connecte l'utilisateur via l'API directement
// Sans passer par l'UI — plus rapide et plus fiable
Cypress.Commands.add("login", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  // Appel direct à l'API pour récupérer le token
  cy.request({
    method: "POST",
    url: "https://api.costincianu.fr/api/auth/login",
    body: {
      email: "gheorghina.costincianu@sfr.fr",
      password: "23197710",
    },
  }).then((response) => {
    // Sauvegarde le token dans le localStorage
    window.localStorage.setItem("jwt_token", response.body.token);
    window.localStorage.setItem("user_email", response.body.email);
  });
});

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
