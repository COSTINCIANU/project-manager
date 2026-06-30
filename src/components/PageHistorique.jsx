// =====================================================
// PageHistorique.jsx — Historique des actions
// Affiche les 50 dernières actions effectuées
// dans l'application avec l'utilisateur et la date
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
        // setLogs(data);
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
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* ---- CARTE PRINCIPALE ---- */}
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
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "1.5rem",
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
              padding: "2rem 0",
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
              padding: "2rem 0",
            }}
          >
            Aucune action enregistrée
          </div>
        )}

        {/* ---- LISTE DES ACTIONS ---- */}
        {!loading &&
          logs.map((log) => {
            const style = getActionColor(log.action);
            return (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {/* Icône action */}
                <div style={{ fontSize: "18px", flexShrink: 0 }}>{getActionIcon(log.action)}</div>

                {/* Infos */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#222" }}>{log.description}</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "2px",
                    }}
                  >
                    👤 {log.userEmail} — 📅 {formatDate(log.createdAt)}
                    {log.ipAddress && (
                      <span style={{ marginLeft: "6px", color: "#ccc" }}>— 🌐 {log.ipAddress}</span>
                    )}
                  </div>
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
                  }}
                >
                  {log.action.replace("_", " ")}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default PageHistorique;
