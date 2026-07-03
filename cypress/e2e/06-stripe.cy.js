// =====================================================
// 06-stripe.cy.js — Tests E2E : Page Stripe / Tarifs
// Teste : affichage plans, boutons CTA, appel checkout
// Note : on ne teste pas le paiement réel Stripe
// car il redirige vers une URL externe
// =====================================================

describe("Page Stripe — Tarification", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/");
    cy.contains("Dashboard", { timeout: 10000 }).should("exist");
    // Navigue vers la page Tarifs
    cy.contains("Tarifs").click({ force: true });
    cy.contains("Choisissez votre plan", { timeout: 8000 }).should("exist");
  });

  it("affiche les 3 plans tarifaires", () => {
    cy.contains("Gratuit").should("exist");
    cy.contains("Pro").should("exist");
    cy.contains("Entreprise").should("exist");
  });

  it("affiche les prix corrects", () => {
    cy.contains("0€").should("exist");
    cy.contains("9€").should("exist");
    cy.contains("29€").should("exist");
  });

  it("affiche le badge Populaire sur le plan Pro", () => {
    cy.contains("⭐ Populaire").should("exist");
  });

  it("affiche le message de sécurité Stripe", () => {
    cy.contains("Paiement sécurisé par Stripe").should("exist");
  });

  it("le bouton Pro déclenche l'appel API checkout", () => {
    // Intercepte et remplace la réponse pour éviter la redirection
    cy.intercept("POST", "**/stripe/checkout", {
      statusCode: 200,
      body: { url: null }, // pas d'URL → pas de redirection
    }).as("checkout");

    cy.contains("button", "Choisir Pro").click({ force: true });

    // Vérifie que l'appel API a été fait avec le bon plan
    cy.wait("@checkout", { timeout: 8000 }).then((interception) => {
      expect(interception.request.body.plan).to.eq("pro");
    });
  });
});
