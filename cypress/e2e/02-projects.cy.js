// =====================================================
// 02-projects.cy.js — Tests E2E : Gestion des projets
// Teste : affichage liste, création, suppression
// =====================================================

describe("Gestion des projets", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/");
    // Attend que l'app soit chargée
    cy.contains("Dashboard", { timeout: 10000 }).should("exist");
    // Navigue vers la page Projets — force car le label peut être caché
    cy.contains("Projets").click({ force: true });
    // Attend que la page projets soit chargée
    cy.contains("projet", { timeout: 8000 }).should("exist");
  });

  it("affiche la liste des projets", () => {
    cy.get("[data-cy='projet-nom']").should("have.length.greaterThan", 0);
  });

  it("crée un nouveau projet", () => {
    cy.contains("+ Nouveau projet").click();
    cy.get("input[placeholder='Nom du projet...']").type("Projet Cypress Test");
    cy.contains("Créer le projet").click();
    cy.contains("Projet Cypress Test", { timeout: 6000 }).should("exist");
  });

  it("affiche le bouton Supprimer sur chaque projet", () => {
    cy.contains("Supprimer").should("exist");
  });

  it("supprime un projet", () => {
    // Crée d'abord un projet à supprimer
    cy.contains("+ Nouveau projet").click();
    cy.get("input[placeholder='Nom du projet...']").type("Projet à supprimer");
    cy.contains("Créer le projet").click();
    cy.contains("Projet à supprimer", { timeout: 6000 }).should("exist");

    // Intercepte window.confirm et accepte automatiquement
    cy.on("window:confirm", () => true);

    // Trouve la carte contenant "Projet à supprimer"
    // et clique sur le bouton Supprimer dans cette carte
    cy.contains("Projet à supprimer")
      .parent()
      .parent()
      .find("button")
      .contains("Supprimer")
      .click({ force: true });

    // Vérifie que le projet a disparu
    cy.contains("Projet à supprimer", { timeout: 6000 }).should("not.exist");
  });
});
