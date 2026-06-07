// =====================================================
// PageApiPublique.jsx — Gestion des clés API publiques
// Permet aux utilisateurs de créer et gérer
// leurs clés API pour accéder à l'API publique
// =====================================================
import { useState, useEffect } from "react";

function PageApiPublique() {
  // =====================
  // ÉTATS
  // =====================

  // Liste des clés API
  const [keys, setKeys] = useState([]);

  // Nom de la nouvelle clé
  const [newKeyName, setNewKeyName] = useState("");

  // Clé nouvellement créée (à afficher une seule fois)
  const [newKeyValue, setNewKeyValue] = useState(null);

  // Chargement
  const [loading, setLoading] = useState(false);

  // Message
  const [message, setMessage] = useState("");

  // =====================
  // CHARGEMENT DES CLÉS
  // =====================
  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api-keys`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) setKeys(data);
    } catch (err) {
      console.error("Erreur chargement clés :", err);
    }
  }

  // =====================
  // CRÉER UNE CLÉ API
  // =====================
  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewKeyValue(data.apiKey);
        setNewKeyName("");
        loadKeys();
      }
    } catch (err) {
      console.error("Erreur création clé :", err);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // RÉVOQUER UNE CLÉ
  // =====================
  async function handleRevoke(id) {
    if (!confirm("Révoquer cette clé API ? Elle ne fonctionnera plus.")) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api-keys/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });
      loadKeys();
      setMessage("Clé révoquée !");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Erreur révocation :", err);
    }
  }

  // =====================
  // COPIER LA CLÉ
  // =====================
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setMessage("Clé copiée !");
    setTimeout(() => setMessage(""), 2000);
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
        gap: "14px",
      }}
    >
      {/* ---- MESSAGE INFO TOKEN ---- */}
      <div
        style={{
          background: "#E8F4FD",
          border: "1px solid #b3d9f7",
          borderRadius: "12px",
          padding: "1rem 1.5rem",
          fontSize: "13px",
          color: "#1565C0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px" }}>ℹ️</span>
        <div>
          Si le bouton "Créer" ne répond pas, votre session a peut-être expiré.
          <strong> Déconnectez-vous et reconnectez-vous</strong> pour rafraîchir
          votre token JWT (validité : 1 heure).
        </div>
      </div>

      {/* ---- DOCUMENTATION ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        <div
          style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}
        >
          🔌 API Publique — Documentation
        </div>

        <div style={{ fontSize: "13px", color: "#555", marginBottom: "1rem" }}>
          Accédez aux données de Project Manager via notre API REST. Ajoutez
          votre clé API dans le header{" "}
          <code
            style={{
              background: "#f0f0f0",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            X-API-Key
          </code>
          .
        </div>

        {/* Endpoints */}
        {[
          {
            method: "GET",
            path: "/api/public/projects",
            desc: "Liste des projets",
          },
          {
            method: "GET",
            path: "/api/public/tasks",
            desc: "Liste des tâches",
          },
          {
            method: "GET",
            path: "/api/public/tasks/{id}",
            desc: "Détail d'une tâche",
          },
          {
            method: "GET",
            path: "/api/public/stats",
            desc: "Statistiques globales",
          },
        ].map((endpoint) => (
          <div
            key={endpoint.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 0",
              borderBottom: "1px solid #f5f5f5",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "4px",
                background: "#EAF3DE",
                color: "#3B6D11",
                flexShrink: 0,
              }}
            >
              {endpoint.method}
            </span>
            <code style={{ fontSize: "12px", color: "#378ADD", flex: 1 }}>
              {endpoint.path}
            </code>
            <span style={{ fontSize: "12px", color: "#aaa" }}>
              {endpoint.desc}
            </span>
          </div>
        ))}

        {/* Exemple curl */}
        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
            Exemple d'utilisation :
          </div>
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "12px",
              color: "#aaa",
              fontFamily: "monospace",
              overflowX: "auto",
            }}
          >
            <span style={{ color: "#639922" }}>curl</span>
            {" -H "}
            <span style={{ color: "#e67e22" }}>"X-API-Key: votre_cle"</span>
            {" \\\n  "}
            <span style={{ color: "#378ADD" }}>
              https://api.costincianu.fr/api/public/projects
            </span>
          </div>
        </div>
      </div>

      {/* ---- NOUVELLE CLÉ ---- */}
      {newKeyValue && (
        <div
          style={{
            background: "#EAF3DE",
            border: "1px solid #c8e6c9",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#2e7d32",
              marginBottom: "0.5rem",
            }}
          >
            ✅ Clé API créée — copiez-la maintenant !
          </div>
          <div
            style={{ fontSize: "12px", color: "#555", marginBottom: "1rem" }}
          >
            Cette clé ne sera plus affichée en entier après fermeture.
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <code
              style={{
                flex: 1,
                padding: "10px 12px",
                background: "#fff",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#222",
                wordBreak: "break-all",
                border: "1px solid #ddd",
              }}
            >
              {newKeyValue}
            </code>
            <button
              onClick={() => copyToClipboard(newKeyValue)}
              style={{
                padding: "10px 16px",
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              📋 Copier
            </button>
          </div>
          <button
            onClick={() => setNewKeyValue(null)}
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#aaa",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            J'ai copié ma clé, fermer
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          style={{
            background: "#EAF3DE",
            color: "#3B6D11",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        >
          ✅ {message}
        </div>
      )}

      {/* ---- CRÉER UNE CLÉ ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        <div
          style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}
        >
          ➕ Créer une clé API
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Nom de la clé (ex: Mon app mobile)"
            style={{
              flex: 1,
              fontSize: "13px",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
            }}
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newKeyName.trim()}
            style={{
              padding: "10px 20px",
              background: loading || !newKeyName.trim() ? "#aaa" : "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !newKeyName.trim() ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "500",
              flexShrink: 0,
            }}
          >
            {loading ? "..." : "Créer"}
          </button>
        </div>
      </div>

      {/* ---- LISTE DES CLÉS ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        <div
          style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}
        >
          🔑 Mes clés API ({keys.filter((k) => k.isActive).length} active
          {keys.filter((k) => k.isActive).length > 1 ? "s" : ""})
        </div>

        {keys.length === 0 ? (
          <div
            style={{
              fontSize: "13px",
              color: "#aaa",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            Aucune clé API — créez-en une !
          </div>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #f5f5f5",
                opacity: key.isActive ? 1 : 0.5,
              }}
            >
              <div>
                <div
                  style={{ fontSize: "13px", color: "#222", fontWeight: "500" }}
                >
                  {key.name}
                  {!key.isActive && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#e74c3c",
                        marginLeft: "8px",
                      }}
                    >
                      Révoquée
                    </span>
                  )}
                </div>
                <div
                  style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}
                >
                  <code>{key.apiKey}</code>
                  {key.lastUsedAt &&
                    ` — Dernière utilisation : ${key.lastUsedAt}`}
                </div>
              </div>

              {key.isActive && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => copyToClipboard(key.fullKey)}
                    style={{
                      padding: "6px 12px",
                      background: "#f0f0f0",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#555",
                    }}
                  >
                    📋 Copier
                  </button>
                  <button
                    onClick={() => handleRevoke(key.id)}
                    style={{
                      padding: "6px 12px",
                      background: "#FCEBEB",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#A32D2D",
                    }}
                  >
                    🗑️ Révoquer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PageApiPublique;
