// =====================================================
// 03-tasks.cy.js — Tests E2E : Gestion des tâches
// =====================================================

describe("Gestion des tâches", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/");
    cy.contains("Dashboard", { timeout: 10000 }).should("exist");
    cy.contains("Tâches").click({ force: true });
    cy.contains("tâche", { timeout: 8000 }).should("exist");
  });

  it("affiche la liste des tâches", () => {
    cy.get("input[placeholder='Nouvelle tâche...']").should("exist");
    cy.contains("Toutes les tâches").should("exist");
  });

  it("crée une nouvelle tâche", () => {
    cy.get("input[placeholder='Nouvelle tâche...']").type("Tâche Cypress Test");
    cy.contains("button", "Ajouter").click({ force: true });
    cy.contains("Tâche Cypress Test", { timeout: 6000 }).should("exist");
  });

  it("coche une tâche comme terminée", () => {
    cy.get("input[placeholder='Nouvelle tâche...']").type("Tâche à cocher");
    cy.contains("button", "Ajouter").click({ force: true });
    cy.contains("Tâche à cocher", { timeout: 6000 }).should("exist");
    // Clique sur le toggle
    cy.contains("Tâche à cocher")
      .parent()
      .parent()
      .find("div[style*='border-radius: 4px']")
      .first()
      .click({ force: true });
    // Attend le PUT puis vérifie que le fond vert apparaît (tâche cochée)
    cy.wait(2000);
    cy.contains("Tâche à cocher")
      .parent()
      .parent()
      .find("div[style*='border-radius: 4px']")
      .first()
      .should("have.css", "background-color", "rgb(99, 153, 34)");
  });

  it("supprime une tâche", () => {
    // Nom unique avec timestamp pour éviter les doublons
    const nom = `Tâche suppression ${Date.now()}`;
    cy.get("input[placeholder='Nouvelle tâche...']").type(nom);
    cy.contains("button", "Ajouter").click({ force: true });
    cy.contains(nom, { timeout: 6000 }).should("exist");
    cy.on("window:confirm", () => true);
    cy.contains(nom)
      .parent()
      .parent()
      .find("div[title='Supprimer la tâche']")
      .click({ force: true });
    cy.wait(2000);
    cy.contains(nom, { timeout: 8000 }).should("not.exist");
  });
});
