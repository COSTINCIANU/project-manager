// =====================================================
// PageChat.jsx — Chat d'équipe en temps réel
// Utilise Mercure (SSE) pour les messages instantanés
// Polling de secours si Mercure n'est pas disponible
// =====================================================
import { useState, useEffect, useRef } from "react";

const MERCURE_URL = "https://mercure.costincianu.fr/.well-known/mercure";
const CHAT_TOPIC = "https://project-manager.costincianu.fr/chat";

function PageChat({ userEmail }) {
  // =====================
  // ÉTATS
  // =====================
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  const pollingRef = useRef(null);

  // =====================
  // SCROLL AUTOMATIQUE
  // =====================
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // =====================
  // CHARGEMENT INITIAL DES MESSAGES
  // =====================
  async function fetchMessages() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Erreur chargement messages :", err);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // CONNEXION MERCURE (SSE)
  // =====================
  function connectMercure() {
    try {
      const url = new URL(MERCURE_URL);
      url.searchParams.append("topic", CHAT_TOPIC);

      const es = new EventSource(url.toString());
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
        // Arrête le polling si Mercure fonctionne
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };

      es.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          setMessages((prev) => {
            // Évite les doublons
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
        } catch (err) {
          console.error("Erreur parsing message Mercure :", err);
        }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Fallback polling si Mercure échoue
        if (!pollingRef.current) {
          pollingRef.current = setInterval(fetchMessages, 5000);
        }
        // Tentative de reconnexion après 5 secondes
        setTimeout(connectMercure, 5000);
      };
    } catch (err) {
      console.error("Erreur connexion Mercure :", err);
      // Fallback polling
      if (!pollingRef.current) {
        pollingRef.current = setInterval(fetchMessages, 5000);
      }
    }
  }

  useEffect(() => {
    // Chargement initial
    fetchMessages();
    // Connexion Mercure
    connectMercure();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =====================
  // ENVOI D'UN MESSAGE
  // =====================
  async function handleSend() {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        // Si pas connecté à Mercure on ajoute manuellement
        if (!connected) {
          setMessages((prev) => [...prev, data]);
        }
        setNewMessage("");
        scrollToBottom();
      }
    } catch (err) {
      console.error("Erreur envoi message :", err);
    } finally {
      setSending(false);
    }
  }

  // =====================
  // FORMATAGE DATE
  // =====================
  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getInitials(email, name) {
    if (name && name !== email) return name[0].toUpperCase();
    return email[0].toUpperCase();
  }

  function getAvatarColor(email) {
    const colors = ["#378ADD", "#639922", "#e67e22", "#9B59B6", "#e74c3c", "#00695C"];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div
      style={{
        // maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 8rem)",
      }}
    >
      {/* ---- EN-TÊTE ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px 12px 0 0",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "20px" }}>💬</span>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500" }}>Chat d'équipe</div>
          <div style={{ fontSize: "11px", color: connected ? "#639922" : "#aaa" }}>
            {connected ? "● Temps réel (Mercure)" : "● Polling 5s (secours)"}
          </div>
        </div>
      </div>

      {/* ---- LISTE DES MESSAGES ---- */}
      <div
        style={{
          flex: 1,
          background: "#f9f9f9",
          border: "1px solid #eee",
          borderTop: "none",
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", color: "#aaa", fontSize: "13px" }}>Chargement...</div>
        )}

        {!loading && messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#aaa",
              fontSize: "13px",
              marginTop: "2rem",
            }}
          >
            Aucun message — soyez le premier à écrire ! 👋
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderEmail === userEmail;
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: isMe ? "row-reverse" : "row",
                gap: "8px",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: getAvatarColor(msg.senderEmail),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}
              >
                {getInitials(msg.senderEmail, msg.senderName)}
              </div>

              <div style={{ maxWidth: "70%" }}>
                {!isMe && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginBottom: "3px",
                      paddingLeft: "4px",
                    }}
                  >
                    {msg.senderName || msg.senderEmail}
                  </div>
                )}
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMe ? "#111" : "#fff",
                    color: isMe ? "#fff" : "#222",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    border: isMe ? "none" : "1px solid #eee",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {msg.content}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#bbb",
                    marginTop: "3px",
                    textAlign: isMe ? "right" : "left",
                    paddingLeft: isMe ? "0" : "4px",
                  }}
                >
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ---- CHAMP DE SAISIE ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: "1rem",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
          placeholder="Écrire un message..."
          style={{
            flex: 1,
            fontSize: "13px",
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: "20px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          style={{
            padding: "10px 20px",
            background: sending || !newMessage.trim() ? "#aaa" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            cursor: sending || !newMessage.trim() ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "500",
            flexShrink: 0,
          }}
        >
          {sending ? "..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}

export default PageChat;
