// =====================================================
// PageStripe.jsx — Page de tarification et paiement
// Affiche les plans tarifaires et gère le paiement
// via Stripe Checkout
// =====================================================
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Chargement de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PageStripe() {
  // =====================
  // ÉTATS
  // =====================

  // Plan sélectionné
  const [loading, setLoading] = useState(null);

  // Message de succès/annulation
  const [message, setMessage] = useState("");

  // =====================
  // VÉRIFICATION RETOUR STRIPE
  // =====================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const plan = params.get("plan");

    if (payment === "success") {
      setMessage(`✅ Paiement réussi ! Votre plan ${plan} est maintenant actif.`);
      // Nettoyer l'URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "cancelled") {
      setMessage("❌ Paiement annulé.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // =====================
  // GÉRER LE PAIEMENT
  // =====================
  async function handleCheckout(plan) {
    setLoading(plan);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirection vers Stripe Checkout
        window.location.href = data.url;
      } else {
        setMessage("❌ Erreur lors de la création de la session de paiement.");
      }
    } catch (err) {
      console.error("Erreur Stripe :", err);
      setMessage("❌ Une erreur s'est produite.");
    } finally {
      setLoading(null);
    }
  }

  // =====================
  // PLANS TARIFAIRES
  // =====================
  const plans = [
    {
      id: "free",
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      description: "Pour les particuliers et petits projets",
      color: "#639922",
      features: [
        "3 projets maximum",
        "10 tâches par projet",
        "2 membres par projet",
        "Kanban & Vue Liste",
        "Export PDF basique",
      ],
      cta: "Commencer gratuitement",
      ctaAction: null,
    },
    {
      id: "pro",
      name: "Pro",
      price: "9€",
      period: "/mois",
      description: "Pour les freelances et équipes",
      color: "#378ADD",
      popular: true,
      features: [
        "Projets illimités",
        "Tâches illimitées",
        "5 membres par projet",
        "Toutes les vues (Gantt, Timeline...)",
        "Assistant IA inclus",
        "Google Drive & Dropbox",
        "Notifications push",
        "Export PDF avancé",
      ],
      cta: "Choisir Pro",
      ctaAction: "pro",
    },
    {
      id: "enterprise",
      name: "Entreprise",
      price: "29€",
      period: "/mois",
      description: "Pour les grandes équipes",
      color: "#9B7FD4",
      features: [
        "Tout le plan Pro",
        "Membres illimités",
        "API publique incluse",
        "Slack & Google Calendar",
        "Wiki par projet",
        "Support prioritaire",
        "Dashboard Admin",
        "SSO (bientôt)",
      ],
      cta: "Choisir Entreprise",
      ctaAction: "enterprise",
    },
  ];

  // =====================
  // RENDU
  // =====================
  return (
    // <div style={{ maxWidth: "900px", margin: "0 auto" }}>
    <div style={{ width: "100%" }}>
      {/* ---- EN-TÊTE ---- */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#111",
            margin: "0 0 8px",
          }}
        >
          Choisissez votre plan
        </h1>
        <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>
          Commencez gratuitement, passez au niveau supérieur quand vous êtes prêt
        </p>
      </div>

      {/* Message succès/annulation */}
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "1.5rem",
            background: message.startsWith("✅") ? "#EAF3DE" : "#FCEBEB",
            color: message.startsWith("✅") ? "#3B6D11" : "#A32D2D",
          }}
        >
          {message}
        </div>
      )}

      {/* ---- PLANS ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: "#fff",
              border: plan.popular ? `2px solid ${plan.color}` : "1px solid #eee",
              borderRadius: "12px",
              padding: "1.5rem",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Badge Populaire */}
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: plan.color,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "3px 12px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                ⭐ Populaire
              </div>
            )}

            {/* Nom du plan */}
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: plan.color,
                marginBottom: "4px",
              }}
            >
              {plan.name}
            </div>

            {/* Description */}
            <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "1rem" }}>
              {plan.description}
            </div>

            {/* Prix */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "32px", fontWeight: "700", color: "#111" }}>
                {plan.price}
              </span>
              <span style={{ fontSize: "13px", color: "#aaa" }}>{plan.period}</span>
            </div>

            {/* Fonctionnalités */}
            <div style={{ flex: 1, marginBottom: "1.5rem" }}>
              {plan.features.map((feature, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "#444",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ color: plan.color, fontSize: "14px" }}>✓</span>
                  {feature}
                </div>
              ))}
            </div>

            {/* Bouton CTA */}
            <button
              onClick={() => plan.ctaAction && handleCheckout(plan.ctaAction)}
              disabled={loading === plan.ctaAction}
              style={{
                width: "100%",
                padding: "10px",
                background: plan.ctaAction ? plan.color : "#f5f5f5",
                color: plan.ctaAction ? "#fff" : "#666",
                border: "none",
                borderRadius: "8px",
                cursor: plan.ctaAction ? "pointer" : "default",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {loading === plan.ctaAction && plan.ctaAction ? "⏳ Chargement..." : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* ---- INFOS PAIEMENT ---- */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f9f9f9",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#aaa",
          textAlign: "center",
        }}
      >
        🔒 Paiement sécurisé par Stripe · Annulation possible à tout moment · Pas d'engagement
      </div>
    </div>
  );
}

export default PageStripe;
