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

    // Intercepte l'appel projets AVANT tout — doit être déclaré en premier
    cy.intercept("GET", "**/api/projects**").as("chargerProjets");

    cy.visit("/");

    // Ouvre la modale de connexion
    cy.get("nav").contains("Se connecter").click({ force: true });

    // Remplit le formulaire
    cy.get('input[type="email"]').type("gheorghina.costincianu@sfr.fr");
    cy.get('input[type="password"]').type("23197710");
    cy.get("button").last().click({ force: true });

    // Attend que le dashboard soit chargé
    cy.contains("Dashboard", { timeout: 10000 }).should("exist");

    // Navigue vers Projets
    cy.contains("◈").click({ force: true });

    // Attend la réponse de l'API projets
    cy.wait("@chargerProjets", { timeout: 10000 });

    // Attend que le bouton soit visible
    cy.contains("+ Nouveau projet", { timeout: 8000 }).should("exist");
  });

  // =====================
  // TEST 1 — Liste des projets
  // =====================
  it("affiche la liste des projets avec le bouton création", () => {
    cy.contains("projet", { matchCase: false }).should("exist");
    cy.contains("+ Nouveau projet").should("exist");
  });

  // =====================
  // TEST 2 — Formulaire création
  // =====================
  it("ouvre et ferme le formulaire de création sans créer de projet", () => {
    cy.contains("+ Nouveau projet").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').should("be.visible");
    cy.contains("Annuler").click({ force: true });
    cy.get('input[placeholder="Nom du projet..."]').should("not.exist");
  });

  // =====================
  // TEST 3 — Bouton Supprimer sur les projets existants
  // =====================
  it("affiche un bouton Supprimer sur chaque projet existant", () => {
    // Récupère la réponse de l'appel déjà intercepté dans beforeEach
    cy.get("@chargerProjets").then((interception) => {
      const projets = interception.response.body;
      const nombreProjets = Array.isArray(projets) ? projets.length : 0;

      if (nombreProjets === 0) {
        // Aucun projet en BDD — état vide attendu
        cy.log("Aucun projet en BDD — état vide vérifié");
        cy.contains("Supprimer").should("not.exist");
      } else {
        // Des projets existent — le bouton Supprimer doit apparaître
        cy.log(`${nombreProjets} projet(s) trouvé(s)`);
        cy.contains("Supprimer", { timeout: 8000 }).should("exist");
      }
    });
  });
});
