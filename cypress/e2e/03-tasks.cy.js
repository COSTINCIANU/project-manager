// =====================================================
// 03-tasks.cy.js — Tests E2E : Gestion des tâches
// Les tâches sont chargées au démarrage dans App.jsx
// Pas d'appel API lors de la navigation — on attend le DOM
// =====================================================

describe("Gestion des tâches", () => {
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
    // "Chargement des données..." disparaît quand loadData() est fini
    cy.contains("Chargement des données...", { timeout: 10000 }).should(
      "not.exist",
    );

    // Navigue vers la page Tâches
    cy.contains("✓").click({ force: true });

    // Attend que le formulaire d'ajout soit visible — signe que la page est prête
    cy.get('input[placeholder="Nouvelle tâche..."]', { timeout: 8000 }).should(
      "exist",
    );
  });

  // =====================
  // TEST 1 — Affichage de la page tâches
  // =====================
  it("affiche la page des tâches avec le formulaire d'ajout", () => {
    // Vérifie le champ de saisie
    cy.get('input[placeholder="Nouvelle tâche..."]').should("exist");

    // Vérifie le bouton Ajouter
    cy.contains("Ajouter").should("exist");
  });

  // =====================
  // TEST 2 — Saisie dans le formulaire sans soumettre
  // =====================
  it("permet de saisir dans le formulaire sans créer de tâche", () => {
    // Tape dans le champ nom
    cy.get('input[placeholder="Nouvelle tâche..."]').type(
      "Tâche de test Cypress",
    );

    // Vérifie que la valeur est bien saisie
    cy.get('input[placeholder="Nouvelle tâche..."]').should(
      "have.value",
      "Tâche de test Cypress",
    );

    // Vide le champ sans soumettre
    cy.get('input[placeholder="Nouvelle tâche..."]').clear();

    // Vérifie que le champ est vide
    cy.get('input[placeholder="Nouvelle tâche..."]').should("have.value", "");
  });

  // =====================
  // TEST 3 — Tâches existantes affichées dans la liste
  // =====================
  it("affiche les tâches existantes ou le message vide", () => {
    // Soit des tâches sont visibles, soit le message "Aucune tâche trouvée"
    cy.get("body").then(($body) => {
      if ($body.text().includes("Aucune tâche trouvée")) {
        // Aucune tâche en BDD — état vide attendu
        cy.log("Aucune tâche en BDD — état vide vérifié");
        cy.contains("Aucune tâche trouvée").should("exist");
      } else {
        // Des tâches existent — le formulaire est présent en bas de liste
        cy.log("Des tâches sont affichées");
        cy.contains("Ajouter").should("exist");
      }
    });
  });

  // =====================
  // TEST 4 — Sélecteur de priorité avec les 4 options
  // =====================
  it("affiche le sélecteur de priorité avec les 4 options", () => {
    // Cherche le select qui contient "Toutes" — c'est le filtre priorité de la page tâches
    cy.get("select").then(($selects) => {
      const selectPriorite = [...$selects].find((el) =>
        el.innerHTML.includes("Toutes"),
      );

      expect(selectPriorite).to.exist;

      // Vérifie les 4 options du filtre
      cy.wrap(selectPriorite).find("option").should("have.length", 4);
      cy.wrap(selectPriorite).find("option").eq(0).should("contain", "Toutes");
      cy.wrap(selectPriorite).find("option").eq(1).should("contain", "Haute");
      cy.wrap(selectPriorite).find("option").eq(2).should("contain", "Moyenne");
      cy.wrap(selectPriorite).find("option").eq(3).should("contain", "Basse");
    });
  });
});
