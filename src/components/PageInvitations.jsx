// =====================================================
// PageInvitations.jsx — Gestion des invitations
// Permet d'inviter des membres à rejoindre un projet
// par email
// =====================================================
import { useState, useEffect } from "react";
import { envoyerInvitation, getInvitations } from "../api";

function PageInvitations({ projects }) {
  // =====================
  // ÉTATS
  // =====================

  // Email de la personne à inviter
  const [email, setEmail] = useState("");

  // Projet sélectionné pour l'invitation
  const [projectId, setProjectId] = useState("");

  // Message de succès ou d'erreur
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Chargement
  const [loading, setLoading] = useState(false);

  // Liste des invitations du projet sélectionné
  const [invitations, setInvitations] = useState([]);

  // =====================
  // CHARGEMENT DES INVITATIONS
  // =====================

  // Charge les invitations quand le projet change
  useEffect(() => {
    async function loadInvitations() {
      if (!projectId) return;
      const data = await getInvitations(projectId);
      if (data) setInvitations(data);
    }
    loadInvitations();
  }, [projectId]);

  // =====================
  // ENVOI DE L'INVITATION
  // =====================

  async function handleInvite() {
    if (!email.trim()) {
      setError("Veuillez saisir un email");
      return;
    }
    if (!projectId) {
      setError("Veuillez sélectionner un projet");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await envoyerInvitation({
        email: email.trim(),
        projectId: parseInt(projectId),
      });

      if (result) {
        setMessage(`✅ Invitation envoyée à ${email} !`);
        setEmail("");
        // On recharge les invitations
        const data = await getInvitations(projectId);
        if (data) setInvitations(data);
      }
    } catch (err) {
      setError("Erreur lors de l'envoi de l'invitation");
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // COULEUR DU STATUT
  // =====================

  function getStatusStyle(status) {
    switch (status) {
      case "accepted":
        return { bg: "#EAF3DE", color: "#3B6D11" };
      case "rejected":
        return { bg: "#FCEBEB", color: "#A32D2D" };
      default:
        return { bg: "#FFF3E0", color: "#E65100" };
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "accepted":
        return "Acceptée";
      case "rejected":
        return "Refusée";
      default:
        return "En attente";
    }
  }

  // =====================
  // RENDU
  // =====================

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ---- FORMULAIRE D'INVITATION ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: "500",
            marginBottom: "1.25rem",
          }}
        >
          ✉️ Inviter un membre
        </div>

        {/* Message de succès */}
        {message && (
          <div
            style={{
              background: "#EAF3DE",
              color: "#3B6D11",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "1rem",
            }}
          >
            {message}
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div
            style={{
              background: "#FCEBEB",
              color: "#A32D2D",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Champ email */}
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
          Email de la personne à inviter
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          placeholder="exemple@email.com"
          style={{
            width: "100%",
            fontSize: "13px",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />

        {/* Sélecteur de projet */}
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
          Projet
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={{
            width: "100%",
            fontSize: "13px",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            marginBottom: "16px",
            background: "#fff",
            boxSizing: "border-box",
          }}
        >
          <option value="">— Choisir un projet —</option>
          {Array.isArray(projects) &&
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>

        {/* Bouton envoyer */}
        <button
          onClick={handleInvite}
          disabled={loading}
          style={{
            padding: "10px 24px",
            background: loading ? "#aaa" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
        </button>
      </div>

      {/* ---- LISTE DES INVITATIONS ---- */}
      {projectId && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: "500",
              marginBottom: "1rem",
            }}
          >
            📋 Invitations envoyées
          </div>

          {invitations.length === 0 ? (
            <div
              style={{
                fontSize: "13px",
                color: "#aaa",
                textAlign: "center",
                padding: "1rem 0",
              }}
            >
              Aucune invitation pour ce projet
            </div>
          ) : (
            invitations.map((inv) => {
              const statusStyle = getStatusStyle(inv.status);
              return (
                <div
                  key={inv.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  {/* Email */}
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#222",
                      }}
                    >
                      {inv.email}
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>
                      {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  {/* Statut */}
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 10px",
                      borderRadius: "20px",
                      background: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {getStatusLabel(inv.status)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default PageInvitations;
