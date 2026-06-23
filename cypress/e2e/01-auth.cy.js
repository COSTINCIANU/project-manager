// =====================================================
// 01-auth.cy.js — Tests E2E : Authentification
// Teste la connexion et l'affichage des erreurs
// =====================================================

describe("Authentification", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit("/");
    // Clique sur le bouton "Se connecter" dans la navbar
    cy.get("nav").contains("Se connecter").click({ force: true });
    // Attend que le champ email soit visible
    cy.get('input[type="email"]').should("be.visible");
  });

  // Vérifie que le formulaire de connexion s'affiche correctement
  it("affiche le formulaire de connexion avec tous les champs", () => {
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get("button").contains("Se connecter").should("exist");
  });

  // Vérifie qu'une erreur s'affiche avec un mauvais mot de passe
  it("affiche une erreur quand les identifiants sont incorrects", () => {
    cy.get('input[type="email"]').type("faux@email.com");
    cy.get('input[type="password"]').type("mauvaismdp");
    // Clique sur le bouton dans le modal — le dernier bouton "Se connecter"
    cy.get("button").last().click({ force: true });
    cy.contains("Email ou mot de passe incorrect", { timeout: 6000 }).should(
      "exist",
    );
  });

  // Vérifie qu'on peut se connecter avec les bonnes infos
  it("connecte l'utilisateur et affiche le dashboard", () => {
    cy.get('input[type="email"]').type("gheorghina.costincianu@sfr.fr");
    cy.get('input[type="password"]').type("23197710");
    cy.get("button").contains("Se connecter").click({ force: true });
    cy.contains("Dashboard", { timeout: 10000 }).should("exist");
  });
});
