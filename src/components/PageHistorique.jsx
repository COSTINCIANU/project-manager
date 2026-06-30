// =====================================================
// PageHistorique.jsx — Historique des actions
// Affiche les 50 dernières actions effectuées
// dans l'application avec l'utilisateur et la date
// Grille responsive : 2 colonnes sur desktop, 1 sur tablette/mobile
// =====================================================
import { useState, useEffect } from "react";

function PageHistorique() {
  // =====================
  // ÉTATS
  // =====================

  // Liste des actions
  const [logs, setLogs] = useState([]);

  // État de chargement
  const [loading, setLoading] = useState(true);

  // =====================
  // CHARGEMENT DES LOGS
  // =====================
  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        });
        const data = await res.json();
        // Vérifie que data est bien un tableau avant de l'utiliser
        if (Array.isArray(data)) setLogs(data);
      } catch (err) {
        console.error("Erreur chargement historique :", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  // =====================
  // ICÔNE SELON L'ACTION
  // =====================
  function getActionIcon(action) {
    switch (action) {
      case "create_task":
        return "✅";
      case "update_task":
        return "✏️";
      case "delete_task":
        return "🗑️";
      case "create_project":
        return "📁";
      case "update_project":
        return "📝";
      case "delete_project":
        return "❌";
      default:
        return "📌";
    }
  }

  // =====================
  // COULEUR SELON L'ACTION
  // =====================
  function getActionColor(action) {
    if (action.startsWith("create")) return { bg: "#EAF3DE", color: "#3B6D11" };
    if (action.startsWith("update")) return { bg: "#E8F4FD", color: "#1976D2" };
    if (action.startsWith("delete")) return { bg: "#FCEBEB", color: "#A32D2D" };
    return { bg: "#f0f0f0", color: "#666" };
  }

  // =====================
  // FORMATAGE DE LA DATE
  // =====================
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ width: "100%" }}>
      {/* ---- EN-TÊTE ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "14px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        📋 Historique des actions
      </div>

      {/* ---- ÉTAT DE CHARGEMENT ---- */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            color: "#aaa",
            fontSize: "13px",
            padding: "3rem 0",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
          }}
        >
          Chargement...
        </div>
      )}

      {/* ---- LISTE VIDE ---- */}
      {!loading && logs.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#aaa",
            fontSize: "13px",
            padding: "3rem 0",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
          }}
        >
          Aucune action enregistrée
        </div>
      )}

      {/* ---- GRILLE 2 COLONNES RESPONSIVE ---- */}
      {!loading && logs.length > 0 && (
        <div
          className="historique-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          {logs.map((log) => {
            const style = getActionColor(log.action);
            return (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}
              >
                {/* Icône action */}
                <div style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>
                  {getActionIcon(log.action)}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#222",
                      }}
                    >
                      {log.description}
                    </div>
                    {/* Badge action */}
                    <div
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: style.bg,
                        color: style.color,
                        fontWeight: "500",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {log.action.replace("_", " ")}
                    </div>
                  </div>

                  {/* <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    👤 {log.userEmail} — 📅 {formatDate(log.createdAt)}
                    {log.ipAddress && (
                      <span style={{ marginLeft: "6px", color: "#ccc" }}>— 🌐 {log.ipAddress}</span>
                    )}
                  </div> */}

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>👤</span>
                    <span>{log.userEmail}</span>
                    <span>—</span>
                    <span>📅</span>
                    <span>{formatDate(log.createdAt)}</span>
                    {log.ipAddress && (
                      <>
                        <span>—</span>
                        <span>🌐</span>
                        <span style={{ color: "#ccc" }}>{log.ipAddress}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---- RESPONSIVE — 1 colonne sur tablette/mobile ---- */}
      <style>{`
        @media (max-width: 900px) {
          .historique-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PageHistorique;
