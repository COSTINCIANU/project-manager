// Page de réinitialisation du mot de passe
// Accessible via /reset-password?token=XXX
import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.costincianu.fr/api";

function PageResetPassword({ token, onDone }) {
  // Nouveau mot de passe saisi par l'utilisateur
  const [password, setPassword] = useState("");
  // Confirmation du mot de passe
  const [confirm, setConfirm] = useState("");
  // Message de retour (succès ou erreur)
  const [message, setMessage] = useState("");
  // État de chargement pendant l'appel API
  const [loading, setLoading] = useState(false);
  // true si la réinitialisation a réussi
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    // Vérification que les deux champs correspondent
    if (password !== confirm) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage("Mot de passe réinitialisé avec succès !");
      } else {
        setMessage(data.message || "Erreur lors de la réinitialisation.");
      }
    } catch (err) {
      setMessage("Erreur réseau. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Logo / Titre */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "32px", marginBottom: "0.5rem" }}>🔐</div>
          <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
            Nouveau mot de passe
          </h2>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "0.5rem" }}>
            Choisis un nouveau mot de passe pour ton compte.
          </p>
        </div>

        {/* Formulaire — affiché uniquement si pas encore succès */}
        {!success && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "#444",
                }}
              >
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "#444",
                }}
              >
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répète le mot de passe"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "#aaa" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
            </button>
          </>
        )}

        {/* Message erreur ou succès */}
        {message && (
          <div
            style={{
              marginTop: "1rem",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              background: success ? "#e8f5e9" : "#fdecea",
              color: success ? "#2e7d32" : "#c62828",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {/* Bouton retour connexion après succès */}
        {success && (
          <button
            onClick={onDone}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              padding: "12px",
              background: "#9B7FD4",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Se connecter
          </button>
        )}
      </div>
    </div>
  );
}

export default PageResetPassword;
