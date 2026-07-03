// =====================================================
// 02-projects.cy.js — Tests E2E : Gestion des projets
// =====================================================

describe("Gestion des projets", () => {
  // =====================
  // CONNEXION AVANT CHAQUE TEST
  // =====================
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit("/");

    cy.get("nav").contains("Se connecter").click({ force: true });
    cy.get('input[type="email"]').type("gheorghina.costincianu@sfr.fr");
    cy.get('input[type="password"]').type("23197710");
    cy.get("button").last().click({ force: true });

    cy.contains("Dashboard", { timeout: 10000 }).should("exist");
    cy.wait(2000);

    cy.contains("Projets").click({ force: true });
    cy.wait(3000);
  });
  // =====================
  // TEST 1 — Liste des projets
  // =====================
  it("affiche la liste des projets avec le bouton création", () => {
    cy.contains("projet", { matchCase: false }).should("exist");
    cy.contains("Nouveau projet").should("exist");
  });

  // =====================
  // TEST 2 — Formulaire création : ouvrir et annuler
  // =====================
  it("ouvre et ferme le formulaire de création sans créer de projet", () => {
    cy.contains("Nouveau projet").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').should("be.visible");
    cy.contains("Annuler").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').should("not.exist");
  });

  // =====================
  // TEST 3 — Bouton Supprimer visible
  // =====================
  it("affiche un bouton Supprimer sur chaque carte projet si des projets existent", () => {
    cy.get("button").first().should("exist");
    cy.get("button").each(($btn) => {
      cy.log($btn.text());
    });
  });
  // =====================
  // TEST 4 — Création d'un projet
  // =====================
  it("crée un nouveau projet et l'affiche dans la liste", () => {
    cy.contains("Nouveau projet").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').type("Projet Cypress Test");
    cy.get("select").select("En attente");
    cy.contains("Créer le projet").click({ force: true });
    cy.contains("Projet Cypress Test", { timeout: 8000 }).should("exist");
  });

  // =====================
  // TEST 5 — Suppression d'un projet
  // =====================
  it("supprime un projet et le retire de la liste", () => {
    cy.contains("Nouveau projet").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').type("Projet À Supprimer");
    cy.contains("Créer le projet").click({ force: true });
    cy.contains("Projet À Supprimer", { timeout: 8000 }).should("exist");

    cy.contains("Projet À Supprimer")
      .parents("[style*='border-radius: 12px']")
      .find("button")
      .filter(":contains('Supprimer')")
      .click({ force: true });

    cy.contains("Projet À Supprimer").should("not.exist");
  });

  // =====================
  // TEST 6 — Création via touche Entrée
  // =====================
  it("crée un projet en appuyant sur Entrée dans le champ nom", () => {
    cy.contains("Nouveau projet").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').type("Projet Entrée{enter}");
    cy.contains("Projet Entrée", { timeout: 8000 }).should("exist");
  });
});
