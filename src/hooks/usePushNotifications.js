// =====================================================
// usePushNotifications.js — Hook React pour les notifications push
// Gère l'enregistrement du Service Worker et l'abonnement
// aux notifications push via l'API Web Push
// =====================================================

import { useState, useEffect } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.costincianu.fr/api";

export function usePushNotifications() {
  // =====================
  // ÉTATS
  // =====================

  // Statut de l'abonnement
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Support des notifications push
  const [isSupported, setIsSupported] = useState(false);

  // Chargement
  const [loading, setLoading] = useState(false);

  // =====================
  // VÉRIFICATION DU SUPPORT
  // =====================
  useEffect(() => {
    // On vérifie que le navigateur supporte les notifications push
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  // =====================
  // VÉRIFICATION DE L'ABONNEMENT EXISTANT
  // =====================
  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error("Erreur vérification abonnement :", err);
    }
  }

  // =====================
  // CONVERSION CLÉ VAPID
  // La clé publique VAPID doit être convertie en Uint8Array
  // =====================
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // =====================
  // ACTIVER LES NOTIFICATIONS
  // =====================
  async function subscribe() {
    setLoading(true);
    try {
      // On enregistre le Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");

      // On récupère la clé publique VAPID depuis l'API
      const res = await fetch(`${API_URL}/push/vapid-key`);
      const { publicKey } = await res.json();

      // On demande l'autorisation à l'utilisateur
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return;
      }

      // On s'abonne aux notifications push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // On envoie l'abonnement à l'API Symfony
      await fetch(`${API_URL}/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
    } catch (err) {
      console.error("Erreur abonnement push :", err);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // DÉSACTIVER LES NOTIFICATIONS
  // =====================
  async function unsubscribe() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // On supprime l'abonnement côté serveur
        await fetch(`${API_URL}/push/unsubscribe`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // On désabonne côté navigateur
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error("Erreur désabonnement push :", err);
    } finally {
      setLoading(false);
    }
  }

  return { isSubscribed, isSupported, loading, subscribe, unsubscribe };
}
