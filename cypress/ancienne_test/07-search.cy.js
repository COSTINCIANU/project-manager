// =====================================================
// 07-search.cy.js — Tests E2E : Recherche avancée
// =====================================================

Cypress.on("uncaught:exception", () => false);

describe("Recherche avancée", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    // Connexion directe via API
    cy.request({
      method: "POST",
      url: "https://api.costincianu.fr/api/auth/login",
      body: {
        email: "gheorghina.costincianu@sfr.fr",
        password: "23197710",
      },
    }).then((response) => {
      window.localStorage.setItem("jwt_token", response.body.token);
      window.localStorage.setItem(
        "user_email",
        "gheorghina.costincianu@sfr.fr",
      );
    });

    // Visite l'app avec le token déjà en place
    cy.visit("/");

    // Attend que le dashboard soit chargé
    cy.contains("Dashboard", { timeout: 15000 }).should("exist");
    cy.contains("Chargement des données...", { timeout: 10000 }).should(
      "not.exist",
    );
    cy.wait(1500);

    // Navigue vers Recherche
    cy.contains("Recherche").click({ force: true });
    cy.wait(2000);

    cy.contains("Filtres de recherche", { timeout: 10000 }).should("exist");
  });

  it("affiche le panneau de filtres de recherche", () => {
    cy.contains("Filtres de recherche").should("exist");
    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').should(
      "exist",
    );
    cy.contains("🔍 Rechercher").should("exist");
    cy.contains("Réinitialiser").should("exist");
  });

  it("retourne des résultats pour un terme valide", () => {
    cy.intercept("GET", "**/api/search**").as("rechercheAPI");
    cy.get('input[placeholder="Nom de la tâche ou du projet..."]').type("test");
    cy.contains("🔍 Rechercher").click({ force: true });
    cy.wait("@rechercheAPI", { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.contains(/résultat/, { timeout: 8000 }).should("exist");
  });

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
    });
  });

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
    });
  });

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
  });

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
