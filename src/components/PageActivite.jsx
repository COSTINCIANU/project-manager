// =====================================================
// PageActivite.jsx — Activité en temps réel
// Affiche les actions récentes de l'équipe
//
// IMPLÉMENTATION ACTUELLE : Polling toutes les 30s
// Compatible o2switch mutualisé
//
// MIGRATION WEBSOCKET FUTURE :
// Remplacer le useEffect polling par :
// const ws = new WebSocket('wss://api.costincianu.fr/ws');
// ws.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   setLogs(prev => [data, ...prev].slice(0, 50));
// };
// Côté Symfony : installer ratchet/pawl ou mercure
// composer require symfony/mercure-bundle
// =====================================================
import { useState, useEffect, useRef } from "react";

// Intervalle de polling en millisecondes (30 secondes)
const POLLING_INTERVAL = 30000;

function PageActivite() {
  // =====================
  // ÉTATS
  // =====================

  // Liste des actions récentes
  const [logs, setLogs] = useState([]);

  // État de chargement initial
  const [loading, setLoading] = useState(true);

  // Dernière mise à jour
  const [lastUpdate, setLastUpdate] = useState(null);

  // Référence pour le timer de polling
  const pollingRef = useRef(null);

  // =====================
  // CHARGEMENT DES LOGS
  // Polling toutes les 30 secondes
  // Pour WebSocket : remplacer par ws.onmessage
  // =====================
  async function fetchLogs() {
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
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erreur chargement activité :", err);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // Connexion Mercure — temps réel !
  // =====================
  useEffect(() => {
    // Chargement initial
    fetchLogs();

    // Connexion Mercure — temps réel !
    try {
      const url = new URL("https://mercure.costincianu.fr/.well-known/mercure");
      url.searchParams.append("topic", "https://project-manager.costincianu.fr/activity");

      const es = new EventSource(url.toString());

      es.onopen = () => {
        // Arrête le polling si Mercure fonctionne
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };

      es.onmessage = (event) => {
        try {
          const newLog = JSON.parse(event.data);
          setLogs((prev) => [newLog, ...prev].slice(0, 50));
          setLastUpdate(new Date());
        } catch (err) {
          console.error("Erreur parsing activité Mercure :", err);
        }
      };

      es.onerror = () => {
        es.close();
        // Fallback polling si Mercure échoue
        if (!pollingRef.current) {
          pollingRef.current = setInterval(fetchLogs, POLLING_INTERVAL);
        }
      };

      pollingRef.current = null;

      return () => {
        es.close();
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    } catch (err) {
      // Fallback polling
      pollingRef.current = setInterval(fetchLogs, POLLING_INTERVAL);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, []);

  // =====================
  // UTILISATEURS ACTIFS
  // Actif = a fait une action dans les 5 dernières minutes
  // =====================
  function getActiveUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeEmails = new Set();
    logs.forEach((log) => {
      if (new Date(log.createdAt) > fiveMinutesAgo) {
        activeEmails.add(log.userEmail);
      }
    });
    return Array.from(activeEmails);
  }

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
  // FORMATAGE DATE RELATIVE
  // ex: "il y a 2 minutes"
  // =====================
  function formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  }

  const activeUsers = getActiveUsers();

  // =====================
  // RENDU
  // =====================
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* ---- CARTE UTILISATEURS ACTIFS ---- */}
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
            marginBottom: "1rem",
          }}
        >
          🟢 Membres actifs
          <span
            style={{
              fontSize: "11px",
              color: "#aaa",
              fontWeight: "400",
              marginLeft: "8px",
            }}
          >
            (dernières 5 minutes)
          </span>
        </div>

        {activeUsers.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#aaa" }}>Aucun membre actif en ce moment</div>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {activeUsers.map((email) => (
              <div
                key={email}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: "#EAF3DE",
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#3B6D11",
                }}
              >
                {/* Indicateur vert */}
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#3B6D11",
                  }}
                />
                {email}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- CARTE FLUX D'ACTIVITÉ ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        {/* En-tête avec dernière mise à jour */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500" }}>⚡ Flux d'activité</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Indicateur de polling */}
            <div
              style={{
                fontSize: "11px",
                color: "#aaa",
              }}
            >
              {lastUpdate
                ? `Mis à jour à ${lastUpdate.toLocaleTimeString("fr-FR")}`
                : "Chargement..."}
            </div>
            {/* Bouton refresh manuel */}
            <button
              onClick={fetchLogs}
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                background: "#f0f0f0",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* État de chargement */}
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

        {/* Liste vide */}
        {!loading && logs.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#aaa",
              fontSize: "13px",
              padding: "2rem 0",
            }}
          >
            Aucune activité enregistrée
          </div>
        )}

        {/* Liste des actions */}
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
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {/* Icône */}
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
                    👤 {log.userEmail}
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

                {/* Date relative */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#aaa",
                    flexShrink: 0,
                    minWidth: "80px",
                    textAlign: "right",
                  }}
                >
                  {formatRelativeDate(log.createdAt)}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default PageActivite;
