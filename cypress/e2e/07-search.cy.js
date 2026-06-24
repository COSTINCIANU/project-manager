// =====================================================
// 07-search.cy.js — Tests E2E : Recherche avancée
// Teste le panneau de filtres et les résultats
// =====================================================

// Ignore les erreurs JS non critiques de l'app — DOIT être hors du describe
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("map is not a function")) {
    return false;
  }
  return true;
});

describe("Recherche avancée", () => {
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

    // Navigue vers la page Recherche
    cy.contains("🔍").click({ force: true });

    // Attend que la page soit bien chargée
    cy.wait(2000);

    // Screenshot pour voir ce que Cypress voit
    cy.screenshot("page-recherche-debug");

    // Attend que le panneau de filtres soit visible
    cy.contains("Filtres de recherche", { timeout: 8000 }).should("exist");
  });

  // =====================
  // TEST 1 — La page recherche s'affiche correctement
  // =====================
  it("affiche le panneau de filtres de recherche", () => {
    cy.contains("Filtres de recherche").should("exist");
    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').should(
      "exist",
    );
    cy.contains("🔍 Rechercher").should("exist");
    cy.contains("Réinitialiser").should("exist");
  });

  // =====================
  // TEST 2 — Recherche par terme retourne des résultats
  // =====================
  it("retourne des résultats pour un terme valide", () => {
    cy.intercept("GET", "**/api/search**").as("rechercheAPI");

    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').type("test");

    cy.contains("🔍 Rechercher").click({ force: true });

    cy.wait("@rechercheAPI", { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      cy.log(`Total résultats : ${interception.response.body.total}`);
    });

    cy.contains(/résultat/, { timeout: 8000 }).should("exist");
  });

  // =====================
  // TEST 3 — Filtre par priorité haute
  // =====================
  it("filtre les résultats par priorité haute", () => {
    cy.intercept("GET", "**/api/search**").as("rechercheAPI");

    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').type("test");

    cy.get("select").then(($selects) => {
      const selectPriorite = [...$selects].find((el) =>
        el.innerHTML.includes("Toutes les priorités"),
      );
      cy.wrap(selectPriorite).select("haute");
    });

    cy.contains("🔍 Rechercher").click({ force: true });

    cy.wait("@rechercheAPI", { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      const taches = interception.response.body.tasks;
      taches.forEach((tache) => {
        expect(tache.priority).to.equal("haute");
      });
    });
  });

  // =====================
  // TEST 4 — Filtre par statut terminé
  // =====================
  it("filtre les résultats par statut terminé", () => {
    cy.intercept("GET", "**/api/search**").as("rechercheAPI");

    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').type("test");

    cy.get("select").then(($selects) => {
      const selectStatut = [...$selects].find((el) =>
        el.innerHTML.includes("Tous les statuts"),
      );
      cy.wrap(selectStatut).select("done");
    });

    cy.contains("🔍 Rechercher").click({ force: true });

    cy.wait("@rechercheAPI", { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      const taches = interception.response.body.tasks;
      taches.forEach((tache) => {
        expect(tache.done).to.be.true;
      });
    });
  });

  // =====================
  // TEST 5 — Bouton Réinitialiser vide les champs
  // =====================
  it("réinitialise les filtres et vide le champ de recherche", () => {
    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').type("test");

    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').should(
      "have.value",
      "test",
    );

    cy.contains("Réinitialiser").click({ force: true });

    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').should(
      "have.value",
      "",
    );

    cy.contains(/résultat/).should("not.exist");
  });

  // =====================
  // TEST 6 — Aucun résultat pour terme inexistant
  // =====================
  it("affiche le message aucun résultat pour un terme inexistant", () => {
    cy.intercept("GET", "**/api/search**").as("rechercheAPI");

    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').type(
      "xyzxyzxyz123456789",
    );

    cy.contains("🔍 Rechercher").click({ force: true });

    cy.wait("@rechercheAPI", { timeout: 10000 });

    cy.contains("Aucun résultat pour ces critères de recherche.", {
      timeout: 8000,
    }).should("exist");
  });
});
