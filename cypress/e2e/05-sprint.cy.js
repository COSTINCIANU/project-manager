// =====================================================
// 05-sprint.cy.js — Tests E2E : Sprints et Backlog
// Le backlog/sprint n'est pas encore implémenté côté web
// On teste les vues existantes liées à la planification :
// Vue Liste, Vue Gantt, Vue Timeline
// =====================================================

describe("Vues de planification", () => {
  // =====================
  // CONNEXION AVANT CHAQUE TEST
  // =====================
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit("/");

    // Ouvre la modale de connexion
    cy.get("nav").contains("Se connecter").click({ force: true });

    // Remplit le formulaire
    cy.get('input[type="email"]').type("gheorghina.costincianu@sfr.fr");
    cy.get('input[type="password"]').type("23197710");
    cy.get("button").last().click({ force: true });

    // Attend que le dashboard soit chargé
    cy.contains("Dashboard", { timeout: 10000 }).should("exist");

    // Attend que le chargement initial soit terminé
    cy.contains("Chargement des données...", { timeout: 10000 }).should(
      "not.exist",
    );
  });

  // =====================
  // TEST 1 — Vue Liste accessible depuis la sidebar
  // =====================
  it("affiche la vue liste depuis la sidebar", () => {
    // Navigue vers Vue Liste
    cy.contains("☰").click({ force: true });

    // Attend que la page soit chargée
    cy.contains(/liste|tâche/i, { timeout: 8000 }).should("exist");
  });

  // =====================
  // TEST 2 — Vue Gantt accessible depuis la sidebar
  // =====================
  it("affiche la vue Gantt depuis la sidebar", () => {
    // Navigue vers Vue Gantt
    cy.contains("📊").click({ force: true });

    // Attend que la page soit chargée
    cy.contains(/gantt/i, { timeout: 8000 }).should("exist");
  });

  // =====================
  // TEST 3 — Vue Calendrier accessible depuis la sidebar
  // =====================
  it("affiche la vue calendrier depuis la sidebar", () => {
    // Navigue vers Vue Calendrier
    cy.contains("📅").first().click({ force: true });

    // Attend que la page soit chargée
    cy.contains(
      /calendrier|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i,
      { timeout: 8000 },
    ).should("exist");
  });

  // =====================
  // TEST 4 — Navigation retour au dashboard
  // =====================
  it("revient au dashboard depuis n'importe quelle vue", () => {
    // Va sur la vue liste
    cy.contains("☰").click({ force: true });

    // Revient au dashboard
    cy.contains("▦").click({ force: true });

    // Vérifie qu'on est bien sur le dashboard
    cy.contains("Dashboard", { timeout: 8000 }).should("exist");
  });
});
