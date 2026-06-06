// =====================================================
// PageChat.jsx — Chat d'équipe en temps réel
// Polling toutes les 5 secondes pour les nouveaux messages
//
// MIGRATION WEBSOCKET FUTURE :
// Remplacer le setInterval par EventSource (Mercure) :
// const es = new EventSource(
//   'https://api.costincianu.fr/.well-known/mercure?topic=chat'
// );
// es.onmessage = (e) => {
//   const msg = JSON.parse(e.data);
//   setMessages(prev => [...prev, msg]);
// };
// return () => es.close();
// =====================================================
import { useState, useEffect, useRef } from "react";

// Intervalle de polling en millisecondes (5 secondes)
const POLLING_INTERVAL = 5000;

function PageChat({ userEmail }) {
  // =====================
  // ÉTATS
  // =====================

  // Liste des messages
  const [messages, setMessages] = useState([]);

  // Nouveau message en cours de saisie
  const [newMessage, setNewMessage] = useState("");

  // État de chargement initial
  const [loading, setLoading] = useState(true);

  // État d'envoi
  const [sending, setSending] = useState(false);

  // Référence pour le scroll automatique en bas
  const messagesEndRef = useRef(null);

  // Référence pour le timer de polling
  const pollingRef = useRef(null);

  // =====================
  // SCROLL AUTOMATIQUE EN BAS
  // =====================
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // =====================
  // CHARGEMENT DES MESSAGES
  // Polling toutes les 5 secondes
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

  useEffect(() => {
    // Chargement initial
    fetchMessages();

    // Polling toutes les 5 secondes
    pollingRef.current = setInterval(fetchMessages, POLLING_INTERVAL);

    // Nettoyage au démontage
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Scroll en bas quand les messages changent
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
        // On ajoute le message immédiatement sans attendre le polling
        setMessages((prev) => [...prev, data]);
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
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // =====================
  // INITIALES DE L'EXPÉDITEUR
  // =====================
  function getInitials(email, name) {
    if (name && name !== email) return name[0].toUpperCase();
    return email[0].toUpperCase();
  }

  // =====================
  // COULEUR AVATAR SELON EMAIL
  // =====================
  function getAvatarColor(email) {
    const colors = [
      "#378ADD",
      "#639922",
      "#e67e22",
      "#9B59B6",
      "#e74c3c",
      "#00695C",
    ];
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
        maxWidth: "800px",
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
          <div style={{ fontSize: "14px", fontWeight: "500" }}>
            Chat d'équipe
          </div>
          <div style={{ fontSize: "11px", color: "#aaa" }}>
            Mis à jour toutes les 5 secondes
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
        {/* État de chargement */}
        {loading && (
          <div style={{ textAlign: "center", color: "#aaa", fontSize: "13px" }}>
            Chargement...
          </div>
        )}

        {/* Aucun message */}
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

        {/* Messages */}
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
              {/* Avatar */}
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

              {/* Bulle de message */}
              <div style={{ maxWidth: "70%" }}>
                {/* Nom expéditeur */}
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
                    borderRadius: isMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
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

                {/* Heure */}
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

        {/* Ancre pour le scroll automatique */}
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
