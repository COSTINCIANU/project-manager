// =====================================================
// PageGoogleCalendar.jsx — Intégration Google Calendar
// Synchronise les tâches avec échéance vers Google Calendar
// Utilise Google Calendar API v3
// =====================================================
import { useState, useEffect } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

function PageGoogleCalendar({ tasks, projects }) {
  // =====================
  // ÉTATS
  // =====================

  // Scripts Google chargés
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  // Token d'accès Calendar
  const [accessToken, setAccessToken] = useState(null);

  // Connecté à Google Calendar
  const [isConnected, setIsConnected] = useState(false);

  // Tâches synchronisées
  const [synced, setSynced] = useState([]);

  // Chargement
  const [loading, setLoading] = useState(false);

  // Message
  const [message, setMessage] = useState("");

  // =====================
  // CHARGEMENT DES SCRIPTS
  // =====================
  useEffect(() => {
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = () => {
      window.gapi.load("client", () => {
        window.gapi.client
          .init({})
          .then(() => window.gapi.client.load("calendar", "v3"))
          .then(() => setGapiLoaded(true));
      });
    };
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = () => setGisLoaded(true);
    document.body.appendChild(gisScript);

    // Vérifie si déjà connecté
    const savedToken = localStorage.getItem("google_calendar_token");
    const expiresAt = localStorage.getItem("google_calendar_expires");
    if (savedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      setAccessToken(savedToken);
      setIsConnected(true);
    }

    return () => {
      document.body.removeChild(gapiScript);
      document.body.removeChild(gisScript);
    };
  }, []);

  // =====================
  // CONNEXION À GOOGLE CALENDAR
  // =====================
  function handleConnect() {
    if (!gapiLoaded || !gisLoaded) return;
    setLoading(true);

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          // Sauvegarde avec expiration 55 minutes
          const expiresAt = Date.now() + 55 * 60 * 1000;
          localStorage.setItem("google_calendar_token", response.access_token);
          localStorage.setItem("google_calendar_expires", expiresAt);
          setAccessToken(response.access_token);
          setIsConnected(true);
          setMessage("✅ Connecté à Google Calendar !");
          setTimeout(() => setMessage(""), 3000);
        }
        setLoading(false);
      },
    });

    tokenClient.requestAccessToken({ prompt: "" });
  }

  // =====================
  // DÉCONNEXION
  // =====================
  function handleDisconnect() {
    localStorage.removeItem("google_calendar_token");
    localStorage.removeItem("google_calendar_expires");
    setAccessToken(null);
    setIsConnected(false);
    setSynced([]);
    setMessage("Déconnecté de Google Calendar");
    setTimeout(() => setMessage(""), 3000);
  }

  // =====================
  // SYNCHRONISER UNE TÂCHE
  // =====================
  async function syncTask(task) {
    if (!accessToken || !task.dueDate) return;

    try {
      window.gapi.client.setToken({ access_token: accessToken });

      // Date de l'événement
      const dueDate = new Date(task.dueDate);
      const startDate = new Date(dueDate);
      startDate.setHours(9, 0, 0);
      dueDate.setHours(10, 0, 0);

      // Nom du projet
      const project = Array.isArray(projects)
        ? projects.find((p) => p.id === task.projectId)
        : null;
      const projectName = project ? project.name : "Project Manager";

      // Création de l'événement
      const event = {
        summary: `📌 ${task.name}`,
        description: `Tâche — ${projectName}\nPriorité : ${task.priority}\n${task.description || ""}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "Europe/Paris",
        },
        end: {
          dateTime: dueDate.toISOString(),
          timeZone: "Europe/Paris",
        },
        colorId:
          task.priority === "critique"
            ? "11"
            : task.priority === "haute"
              ? "6"
              : task.priority === "normale"
                ? "1"
                : "2",
      };

      await window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      setSynced((prev) => [...prev, task.id]);
      return true;
    } catch (err) {
      console.error("Erreur sync Calendar :", err);
      return false;
    }
  }

  // =====================
  // SYNCHRONISER TOUTES LES TÂCHES
  // =====================
  async function handleSyncAll() {
    setLoading(true);
    setMessage("");

    const tasksWithDate = (Array.isArray(tasks) ? tasks : []).filter((t) => t.dueDate && !t.done);

    let count = 0;
    for (const task of tasksWithDate) {
      const ok = await syncTask(task);
      if (ok) count++;
    }

    setMessage(`✅ ${count} tâche(s) synchronisée(s) avec Google Calendar !`);
    setTimeout(() => setMessage(""), 5000);
    setLoading(false);
  }

  // =====================
  // NOM DU PROJET
  // =====================
  function getProjectName(projectId) {
    const p = Array.isArray(projects) ? projects.find((p) => p.id === projectId) : null;
    return p ? p.name : "—";
  }

  const tasksWithDate = (Array.isArray(tasks) ? tasks : []).filter((t) => t.dueDate && !t.done);

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* ---- CARTE CONNEXION ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "4px",
              }}
            >
              📅 Google Calendar
            </div>
            <div style={{ fontSize: "12px", color: "#aaa" }}>
              {isConnected
                ? "Connecté — vos tâches peuvent être synchronisées"
                : "Connectez-vous pour synchroniser vos tâches"}
            </div>
          </div>

          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={loading || !gapiLoaded || !gisLoaded}
            style={{
              padding: "10px 20px",
              background: isConnected ? "#FCEBEB" : "#111",
              color: isConnected ? "#A32D2D" : "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !gapiLoaded || !gisLoaded ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {loading ? "..." : isConnected ? "Déconnecter" : "Se connecter"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              marginTop: "1rem",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              background: message.startsWith("✅") ? "#EAF3DE" : "#f5f5f5",
              color: message.startsWith("✅") ? "#3B6D11" : "#666",
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* ---- CARTE SYNCHRONISATION ---- */}
      {isConnected && (
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
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "500" }}>
              Tâches à synchroniser ({tasksWithDate.length})
            </div>
            <button
              onClick={handleSyncAll}
              disabled={loading || tasksWithDate.length === 0}
              style={{
                padding: "8px 16px",
                background: loading || tasksWithDate.length === 0 ? "#aaa" : "#378ADD",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: loading || tasksWithDate.length === 0 ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {loading ? "Synchronisation..." : "🔄 Tout synchroniser"}
            </button>
          </div>

          {/* Liste des tâches */}
          {tasksWithDate.length === 0 ? (
            <div
              style={{
                fontSize: "13px",
                color: "#aaa",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              Aucune tâche avec date d'échéance
            </div>
          ) : (
            tasksWithDate.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #f5f5f5",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", color: "#222" }}>{task.name}</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "2px",
                    }}
                  >
                    {getProjectName(task.projectId)} — 📅 {task.dueDate}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {synced.includes(task.id) && (
                    <span style={{ fontSize: "11px", color: "#3B6D11" }}>✅ Synchronisé</span>
                  )}
                  <button
                    onClick={() => syncTask(task)}
                    disabled={synced.includes(task.id)}
                    style={{
                      padding: "6px 12px",
                      background: synced.includes(task.id) ? "#f0f0f0" : "#fff",
                      color: synced.includes(task.id) ? "#aaa" : "#378ADD",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      cursor: synced.includes(task.id) ? "not-allowed" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {synced.includes(task.id) ? "Ajouté" : "📅 Ajouter"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PageGoogleCalendar;
