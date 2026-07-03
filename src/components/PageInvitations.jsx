// =====================================================
// PageInvitations.jsx — Gestion des invitations
// et jauge de charge par membre
// =====================================================
import { useState, useEffect } from "react";
import { envoyerInvitation, getInvitations, getWorkload } from "../api";

// =====================
// COULEUR PAR NIVEAU DE CHARGE
// =====================
function couleurNiveau(niveau) {
  switch (niveau) {
    case "élevé":
      return { bg: "#FEE2E2", color: "#EF4444" };
    case "moyen":
      return { bg: "#FFEDD5", color: "#F97316" };
    default:
      return { bg: "#DCFCE7", color: "#22C55E" };
  }
}

function PageInvitations({ projects }) {
  // =====================
  // ÉTATS INVITATIONS
  // =====================
  const [email, setEmail] = useState("");
  const [projectId, setProjectId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);

  // =====================
  // ÉTATS WORKLOAD
  // =====================
  const [workload, setWorkload] = useState(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  // =====================
  // CHARGEMENT INVITATIONS + WORKLOAD
  // quand le projet sélectionné change
  // =====================
  useEffect(() => {
    if (!projectId) {
      setInvitations([]);
      setWorkload(null);
      return;
    }

    // Charge les invitations
    async function loadInvitations() {
      const data = await getInvitations(projectId);
      if (Array.isArray(data)) setInvitations(data);
    }

    // Charge le workload
    async function loadWorkload() {
      setLoadingWorkload(true);
      try {
        const data = await getWorkload(projectId);
        setWorkload(data);
      } catch {
        setWorkload(null);
      } finally {
        setLoadingWorkload(false);
      }
    }

    loadInvitations();
    loadWorkload();
  }, [projectId]);

  // =====================
  // ENVOI INVITATION
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
        const data = await getInvitations(projectId);
        if (Array.isArray(data)) setInvitations(data);
      }
    } catch {
      setError("Erreur lors de l'envoi de l'invitation");
    } finally {
      setLoading(false);
    }
  }

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
        <div style={{ fontSize: "15px", fontWeight: "500", marginBottom: "1.25rem" }}>
          ✉️ Inviter un membre
        </div>

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

        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>Projet</div>
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

      {/* ---- JAUGE DE CHARGE PAR MEMBRE ---- */}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: "500" }}>⚡ Charge par membre</div>
            {workload && (
              <div style={{ fontSize: "12px", color: "#aaa" }}>
                {workload.total} membre{workload.total > 1 ? "s" : ""} assigné
                {workload.total > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Chargement */}
          {loadingWorkload && (
            <div style={{ textAlign: "center", padding: "1rem", color: "#aaa", fontSize: "13px" }}>
              Chargement...
            </div>
          )}

          {/* Aucun membre assigné */}
          {!loadingWorkload && workload && workload.membres.length === 0 && (
            <div
              style={{
                fontSize: "13px",
                color: "#aaa",
                textAlign: "center",
                padding: "1rem 0",
              }}
            >
              Aucune tâche assignée dans ce projet
            </div>
          )}

          {/* Liste des membres */}
          {!loadingWorkload &&
            workload &&
            workload.membres.map((membre) => {
              const { bg, color } = couleurNiveau(membre.niveau);
              const pct =
                membre.tachesTotal > 0
                  ? Math.round((membre.tachesRestantes / membre.tachesTotal) * 100)
                  : 0;

              return (
                <div
                  key={membre.userId}
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  {/* Ligne 1 — nom + badge niveau */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Initiales */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "14px",
                          color,
                          flexShrink: 0,
                        }}
                      >
                        {membre.nom.charAt(0).toUpperCase()}
                      </div>
                      {/* Nom + email */}
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>
                          {membre.nom}
                        </div>
                        <div style={{ fontSize: "11px", color: "#aaa" }}>
                          {membre.role ?? "membre"} • {membre.email}
                        </div>
                      </div>
                    </div>

                    {/* Badge niveau */}
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background: bg,
                        color,
                        fontWeight: "600",
                      }}
                    >
                      {membre.niveau}
                    </span>
                  </div>

                  {/* Barre de progression */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: "8px",
                        borderRadius: "4px",
                        background: "#f0f0f0",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "8px",
                          borderRadius: "4px",
                          background: color,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color,
                        minWidth: "36px",
                        textAlign: "right",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: "700", color }}>
                        {membre.tachesRestantes}
                      </div>
                      <div style={{ fontSize: "10px", color: "#aaa" }}>restantes</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#22C55E" }}>
                        {membre.tachesTerminees}
                      </div>
                      <div style={{ fontSize: "10px", color: "#aaa" }}>terminées</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#555" }}>
                        {membre.tachesTotal}
                      </div>
                      <div style={{ fontSize: "10px", color: "#aaa" }}>total</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

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
          <div style={{ fontSize: "15px", fontWeight: "500", marginBottom: "1rem" }}>
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
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#222" }}>
                      {inv.email}
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>
                      {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
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
