// =====================================================
// 06-stripe.cy.js — Tests E2E : Page Stripe et tarifs
// Vérifie l'affichage des plans et les boutons de paiement
// Sans déclencher de vrai paiement Stripe
// =====================================================

describe("Page Stripe et tarifs", () => {
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

    // Navigue vers la page Tarifs via l'icône sidebar
    cy.contains("💳").click({ force: true });

    // Attend que le titre de la page soit visible
    cy.contains("Choisissez votre plan", { timeout: 8000 }).should("exist");
  });

  // =====================
  // TEST 1 — Les 3 plans sont affichés
  // =====================
  it("affiche les 3 plans tarifaires", () => {
    cy.contains("Gratuit").should("exist");
    cy.contains("Pro").should("exist");
    cy.contains("Entreprise").should("exist");
  });

  // =====================
  // TEST 2 — Les prix sont affichés correctement
  // =====================
  it("affiche les prix des plans", () => {
    cy.contains("0€").should("exist");
    cy.contains("9€").should("exist");
    cy.contains("29€").should("exist");
  });

  // =====================
  // TEST 3 — Les boutons CTA sont présents
  // =====================
  it("affiche les boutons d'action sur chaque plan", () => {
    cy.contains("Commencer gratuitement").should("exist");
    cy.contains("Choisir Pro").should("exist");
    cy.contains("Choisir Entreprise").should("exist");
  });

  // =====================
  // TEST 4 — Le badge Populaire est sur le plan Pro
  // =====================
  it("affiche le badge Populaire sur le plan Pro", () => {
    cy.contains("⭐ Populaire").should("exist");
  });

  // =====================
  // TEST 5 — Le message de sécurité Stripe est affiché
  // =====================
  it("affiche le message de paiement sécurisé", () => {
    cy.contains("Paiement sécurisé par Stripe").should("exist");
  });

  // =====================
  // TEST 6 — Le bouton Pro intercepte l'appel Stripe sans rediriger
  // =====================
  it("le bouton Pro déclenche un appel vers l'API Stripe", () => {
    // Intercepte l'appel checkout avant de cliquer
    cy.intercept("POST", "**/stripe/checkout**").as("stripeCheckout");

    // Clique sur le bouton Pro
    cy.contains("Choisir Pro").click({ force: true });

    // Attend l'appel API checkout (sans attendre la redirection)
    cy.wait("@stripeCheckout", { timeout: 10000 }).then((interception) => {
      // Vérifie que l'appel a bien été fait avec le bon plan
      expect(interception.request.body).to.have.property("plan", "pro");
      cy.log("Appel Stripe checkout déclenché avec plan=pro ✅");
    });
  });
});
