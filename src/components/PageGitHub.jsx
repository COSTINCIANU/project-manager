// =====================================================
// PageGitHub.jsx — Intégration GitHub
// Affiche les commits GitHub liés aux tâches
// et explique comment configurer le webhook
// =====================================================
import { useState, useEffect } from "react";

// Récupère tous les commits
async function getCommits() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/github/commits`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
    },
  });
  if (!res.ok) return [];
  return res.json();
}

function PageGitHub({ tasks }) {
  // =====================
  // ÉTATS
  // =====================
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("commits");

  // =====================
  // CHARGEMENT
  // =====================
  useEffect(() => {
    async function load() {
      const data = await getCommits();
      // if (data) setCommits(data);
      if (Array.isArray(data)) setCommits(data);
      setLoading(false);
    }
    load();
  }, []);

  // =====================
  // FONCTIONS
  // =====================

  // Trouve le nom de la tâche liée
  function getTaskName(taskId) {
    if (!taskId) return null;
    const task = Array.isArray(tasks) ? tasks.find((t) => t.id === taskId) : null;
    return task ? task.name : `Tâche #${taskId}`;
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ---- ONGLETS ---- */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "#f5f5f5",
          padding: "4px",
          borderRadius: "10px",
          width: "fit-content",
        }}
      >
        {[
          { id: "commits", label: "📝 Commits" },
          { id: "setup", label: "⚙️ Configuration" },
        ].map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "7px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? "500" : "400",
              background: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? "#111" : "#888",
              boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* ---- ONGLET COMMITS ---- */}
      {activeTab === "commits" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: "500",
              marginBottom: "1rem",
            }}
          >
            Derniers commits
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>Chargement...</div>
          ) : commits.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#aaa",
                padding: "2rem",
                fontSize: "13px",
              }}
            >
              Aucun commit pour l'instant — configurez le webhook GitHub pour commencer !
            </div>
          ) : (
            commits.map((commit) => (
              <div
                key={commit.id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #f5f5f5",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                {/* SHA */}
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    background: "#f0f0f0",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    color: "#666",
                    flexShrink: 0,
                  }}
                >
                  {commit.sha}
                </div>

                {/* Infos commit */}
                <div style={{ flex: 1 }}>
                  {/* Message */}
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#222",
                      marginBottom: "4px",
                    }}
                  >
                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#222", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#378ADD")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#222")}
                    >
                      {commit.message}
                    </a>
                  </div>

                  {/* Métadonnées */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "11px",
                      color: "#aaa",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>👤 {commit.author}</span>
                    <span>📁 {commit.repository}</span>
                    <span>📅 {new Date(commit.committedAt).toLocaleDateString("fr-FR")}</span>

                    {/* Tâche liée */}
                    {commit.taskId && (
                      <span
                        style={{
                          background: "#E8F4FD",
                          color: "#1976D2",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          fontWeight: "500",
                        }}
                      >
                        🔗 {getTaskName(commit.taskId)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- ONGLET CONFIGURATION ---- */}
      {activeTab === "setup" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Guide de configuration */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              ⚙️ Comment configurer le webhook GitHub
            </div>

            {[
              {
                step: "1",
                title: "Aller dans les paramètres du repo GitHub",
                desc: "Settings → Webhooks → Add webhook",
              },
              {
                step: "2",
                title: "Configurer l'URL du webhook",
                desc: "Payload URL :",
                code: "http://project-manager-api.xena8933.odns.fr/api/github/webhook",
              },
              {
                step: "3",
                title: "Configurer le Content Type",
                desc: "Content type : application/json",
              },
              {
                step: "4",
                title: "Choisir les événements",
                desc: "Sélectionne : Just the push event",
              },
              {
                step: "5",
                title: "Lier un commit à une tâche",
                desc: "Dans ton message de commit, ajoute #ID de la tâche :",
                code: 'git commit -m "feat: add login page #3"',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  alignItems: "flex-start",
                }}
              >
                {/* Numéro de l'étape */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#111",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>

                {/* Contenu de l'étape */}
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#222",
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{item.desc}</div>
                  {item.code && (
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        background: "#f5f5f5",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        marginTop: "6px",
                        color: "#333",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.code}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Convention des messages */}
          <div
            style={{
              background: "#E8F4FD",
              border: "1px solid #BBDEFB",
              borderRadius: "12px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#1976D2",
                marginBottom: "8px",
              }}
            >
              💡 Convention des messages de commit
            </div>
            <div style={{ fontSize: "13px", color: "#1565C0", lineHeight: "1.6" }}>
              Pour lier un commit à une tâche, ajoute #ID dans ton message :
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
                background: "#fff",
                padding: "8px 12px",
                borderRadius: "6px",
                marginTop: "8px",
                color: "#333",
                lineHeight: "1.8",
              }}
            >
              git commit -m "feat: créer la page login #5"
              <br />
              git commit -m "fix: corriger le bug d'auth #5"
              <br />
              git commit -m "docs: mettre à jour le README #12"
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PageGitHub;
