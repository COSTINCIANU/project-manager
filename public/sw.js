// =====================================================
// sw.js — Service Worker pour les notifications push
// Gère la réception et l'affichage des notifications
// push même quand l'application est fermée
// =====================================================

// Écoute les événements push
self.addEventListener("push", function (event) {
  // On parse le payload JSON
  const data = event.data ? event.data.json() : {};

  const title = data.title || "Project Manager";
  const options = {
    body: data.body || "Nouvelle notification",
    icon: data.icon || "/favicon.svg",
    badge: "/favicon.svg",
    data: {
      url: data.url || "https://project-manager.costincianu.fr",
    },
  };

  // On affiche la notification
  event.waitUntil(self.registration.showNotification(title, options));
});

// Écoute les clics sur les notifications
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // On ouvre l'URL associée à la notification
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
