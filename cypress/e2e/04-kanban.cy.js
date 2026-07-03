// =====================================================
// 04-kanban.cy.js — Tests E2E : Vue Kanban
// Teste : affichage colonnes, cartes, changement statut
// Note : le drag & drop dnd-kit n'est pas testable
// directement avec Cypress — on teste via l'API
// =====================================================

describe("Vue Kanban", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/");
    cy.contains("Dashboard", { timeout: 10000 }).should("exist");
    cy.contains("Kanban").click({ force: true });
    // Attend que le board soit chargé
    cy.contains("À faire", { timeout: 8000 }).should("exist");
  });

  it("affiche les 3 colonnes du kanban", () => {
    cy.contains("À faire").should("exist");
    cy.contains("En cours").should("exist");
    cy.contains("Terminées").should("exist");
  });

  it("affiche les cartes tâches dans les colonnes", () => {
    // Au moins une colonne contient des tâches ou le message vide
    cy.get(".kanban-colonne").should("have.length", 3);
  });

  it("chaque colonne affiche un compteur", () => {
    // Les compteurs sont des divs avec background #eee
    cy.get(".kanban-colonne").each(($col) => {
      cy.wrap($col).find("div[style*='background: rgb(238, 238, 238)']").should("exist");
    });
  });

  it("déplace une tâche via l'API — À faire vers En cours", () => {
    // Crée une tâche via l'API directement
    cy.request({
      method: "POST",
      url: "https://api.costincianu.fr/api/tasks",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("jwt_token")}`,
        "Content-Type": "application/json",
      },
      body: {
        name: "Tâche Kanban Test",
        projectId: 1,
        priority: "normale",
        done: false,
        inProgress: false,
      },
    }).then((res) => {
      const taskId = res.body.id;
      // Déplace en "En cours" via PUT
      cy.request({
        method: "PUT",
        url: `https://api.costincianu.fr/api/tasks/${taskId}`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("jwt_token")}`,
          "Content-Type": "application/json",
        },
        body: { inProgress: true, done: false },
      }).then((res2) => {
        expect(res2.status).to.eq(200);
        expect(res2.body.inProgress).to.eq(true);
      });
      // Nettoie — supprime la tâche de test
      cy.request({
        method: "DELETE",
        url: `https://api.costincianu.fr/api/tasks/${taskId}`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("jwt_token")}`,
        },
      });
    });
  });
});
