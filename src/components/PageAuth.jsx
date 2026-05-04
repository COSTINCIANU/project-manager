// Importation de useState pour gérer le formulaire
import { useState } from "react";

function PageAuth({ onLogin }) {
  // =====================
  // ÉTATS DU FORMULAIRE
  // =====================

  // Mode actif — login ou register
  const [mode, setMode] = useState("login");

  // Champs du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Message d'erreur ou de succès
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // État de chargement
  const [loading, setLoading] = useState(false);

  // =====================
  // FONCTIONS
  // =====================

  // Fonction de connexion
  async function handleLogin() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("https://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Erreur — on affiche le message d'erreur
        setError(data.error || "Erreur de connexion");
        return;
      }

      // Connexion réussie — on sauvegarde le token
      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("user_email", data.email);

      // On informe le composant parent que l'utilisateur est connecté
      onLogin(data.token, data.email);
    } catch (error) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  // Fonction d'inscription
  async function handleRegister() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("https://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur d'inscription");
        return;
      }

      // Inscription réussie — on passe en mode login
      setMessage("Inscription réussie ! Connectez-vous maintenant.");
      setMode("login");
      setPassword("");
    } catch (error) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // RENDU
  // =====================

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
          width: "380px",
          border: "1px solid #eee",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Logo / Titre */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📊</div>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "#111" }}>
            Project Manager
          </div>
          <div style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
            {mode === "login"
              ? "Connectez-vous à votre compte"
              : "Créez votre compte"}
          </div>
        </div>

        {/* Onglets Login / Register */}
        <div
          style={{
            display: "flex",
            background: "#f5f5f5",
            borderRadius: "8px",
            padding: "4px",
            marginBottom: "1.5rem",
          }}
        >
          {["login", "register"].map((m) => (
            <div
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
                setMessage("");
              }}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#111" : "#999",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {m === "login" ? "Connexion" : "Inscription"}
            </div>
          ))}
        </div>

        {/* Message de succès */}
        {message && (
          <div
            style={{
              background: "#EAF3DE",
              color: "#3B6D11",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "1rem",
            }}
          >
            {message}
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div
            style={{
              background: "#FCEBEB",
              color: "#A32D2D",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Champ email */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
            Email
          </div>
          <input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              fontSize: "13px",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Champ mot de passe */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
            Mot de passe
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              (mode === "login" ? handleLogin() : handleRegister())
            }
            style={{
              width: "100%",
              fontSize: "13px",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Bouton principal */}
        <button
          onClick={mode === "login" ? handleLogin : handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#aaa" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {loading
            ? "Chargement..."
            : mode === "login"
              ? "Se connecter"
              : "S'inscrire"}
        </button>
      </div>
    </div>
  );
}

export default PageAuth;
