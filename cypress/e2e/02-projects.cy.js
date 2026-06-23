// =====================================================
// 02-projects.cy.js — Tests E2E : Gestion des projets
// Teste la création, l'affichage et la suppression
// =====================================================

function seConnecter() {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.visit("/");
  cy.get("nav").contains("Se connecter").click({ force: true });
  cy.get('input[type="email"]').type("gheorghina.costincianu@sfr.fr");
  cy.get('input[type="password"]').type("23197710");
  cy.get("button").last().click({ force: true });
  cy.contains("Dashboard", { timeout: 10000 }).should("exist");
}

describe("Gestion des projets", () => {
  beforeEach(() => {
    seConnecter();
    // Clique sur "Projets" dans la sidebar
    // Clique sur l'icône Projets dans la sidebar (◈)
    cy.contains("◈").click({ force: true });
    cy.wait(1000);
    // Attend que le bouton + Nouveau projet soit visible
    cy.contains("+ Nouveau projet", { timeout: 8000 }).should("exist");
  });

  // Vérifie que la liste des projets s'affiche
  it("affiche la liste des projets", () => {
    cy.contains("projet", { matchCase: false }).should("exist");
    cy.contains("+ Nouveau projet").should("exist");
  });

  // Vérifie qu'on peut créer un nouveau projet
  it("crée un nouveau projet avec un nom et un statut", () => {
    cy.contains("+ Nouveau projet").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').type("Projet Test Cypress");
    cy.contains("Créer le projet").click({ force: true });
    cy.contains("Projet Test Cypress", { timeout: 8000 }).should("exist");
  });

  // Vérifie qu'on peut supprimer un projet
  it("supprime un projet existant", () => {
    cy.contains("+ Nouveau projet").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').type("Projet à supprimer");
    cy.contains("Créer le projet").click({ force: true });
    cy.contains("Projet à supprimer", { timeout: 8000 }).should("exist");
    cy.contains("Projet à supprimer")
      .parents("div")
      .first()
      .contains("Supprimer")
      .click({ force: true });
    cy.contains("Projet à supprimer").should("not.exist");
  });
});
