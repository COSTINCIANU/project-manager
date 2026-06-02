// =====================================================
// PageAssistantIA.jsx — Assistant IA intégré
// Utilise l'API Claude d'Anthropic pour aider
// l'utilisateur à gérer ses projets
// =====================================================
import { useState } from "react";

function PageAssistantIA({ tasks, projects }) {
  // =====================
  // ÉTATS
  // =====================

  // Historique des messages du chat
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis votre assistant IA pour Project Manager. Je peux vous aider à :\n\n• Générer des tâches automatiquement\n• Résumer l'état de vos projets\n• Répondre à vos questions\n\nComment puis-je vous aider ?",
    },
  ]);

  // Message en cours de saisie
  const [input, setInput] = useState("");

  // État de chargement
  const [loading, setLoading] = useState(false);

  // =====================
  // CONTEXTE DU PROJET
  // =====================

  // On prépare un résumé du contexte pour l'IA
  function buildContext() {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeProjects = Array.isArray(projects) ? projects : [];

    const doneTasks = safeTasks.filter((t) => t.done).length;
    const totalTasks = safeTasks.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const enRetard = safeTasks.filter((t) => {
      if (t.done || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length;

    return `Tu es un assistant de gestion de projet. Voici le contexte actuel :

PROJETS (${safeProjects.length}) :
${safeProjects.map((p) => `- ${p.name} : ${p.status} (${p.progress}%)`).join("\n")}

TÂCHES : ${totalTasks} au total, ${doneTasks} terminées, ${enRetard} en retard

TÂCHES EN COURS :
${safeTasks
  .filter((t) => !t.done)
  .slice(0, 10)
  .map(
    (t) =>
      `- ${t.name} (${t.priority}) ${t.dueDate ? `— échéance: ${t.dueDate}` : ""}`,
  )
  .join("\n")}

Réponds en français, de façon concise et pratique.`;
  }

  // =====================
  // ENVOI DU MESSAGE
  // =====================
  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Ajoute le message utilisateur
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Appel à notre backend Symfony qui appelle Claude
      // La clé API reste cachée côté serveur !
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          system: buildContext(),
        }),
      });

      const data = await response.json();

      // Ajoute la réponse de l'IA
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.content,
          simulated: data.simulated,
        },
      ]);
    } catch (error) {
      console.error("Erreur IA :", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Désolé, une erreur s'est produite. Réessayez.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // SUGGESTIONS RAPIDES
  // =====================
  const suggestions = [
    "Résume l'état de mes projets",
    "Quelles tâches sont en retard ?",
    "Génère 5 tâches pour un projet e-commerce",
    "Quelles tâches dois-je prioriser ?",
  ];

  // =====================
  // RENDU
  // =====================
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)",
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* ---- EN-TÊTE ---- */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          🤖
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500" }}>
            Assistant IA
          </div>
          <div style={{ fontSize: "11px", color: "#aaa" }}>
            Propulsé par Claude (Anthropic)
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "20px",
            background: "#EAF3DE",
            color: "#3B6D11",
          }}
        >
          ● En ligne
        </div>
      </div>

      {/* ---- MESSAGES ---- */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius:
                  msg.role === "user"
                    ? "12px 12px 2px 12px"
                    : "12px 12px 12px 2px",
                background: msg.role === "user" ? "#111" : "#f5f5f5",
                color: msg.role === "user" ? "#fff" : "#222",
                fontSize: "13px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Indicateur de chargement */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px 12px 12px 2px",
                background: "#f5f5f5",
                fontSize: "13px",
                color: "#aaa",
              }}
            >
              ⏳ Réflexion en cours...
            </div>
          </div>
        )}
      </div>

      {/* ---- SUGGESTIONS ---- */}
      {messages.length === 1 && (
        <div
          style={{
            padding: "0 1rem",
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => setInput(s)}
              style={{
                fontSize: "12px",
                padding: "5px 10px",
                borderRadius: "20px",
                border: "1px solid #ddd",
                cursor: "pointer",
                color: "#666",
                background: "#fff",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5f5f5";
                e.currentTarget.style.borderColor = "#aaa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#ddd";
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      {/* ---- ZONE DE SAISIE ---- */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Posez une question sur vos projets..."
          disabled={loading}
          style={{
            flex: 1,
            fontSize: "13px",
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            background: loading ? "#f9f9f9" : "#fff",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 20px",
            background: loading || !input.trim() ? "#ccc" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default PageAssistantIA;
