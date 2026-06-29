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

  // Mot de passe réinitialisation
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // 2FA — affichage du formulaire de code
  const [show2FA, setShow2FA] = useState(false);
  // Code 2FA saisi par l'utilisateur
  const [twoFactorCode, setTwoFactorCode] = useState("");
  // Chargement vérification 2FA
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // =====================
  // FONCTIONS
  // =====================

  // Fonction de connexion
  async function handleLogin() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      // Si le 2FA est activé sur ce compte
      if (data.twoFactorRequired) {
        // On envoie le code par email
        await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        // On affiche le formulaire de code
        setShow2FA(true);
        return;
      }

      // Connexion normale sans 2FA
      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("user_email", data.email);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur d'inscription");
        return;
      }

      setMessage("Inscription réussie ! Connectez-vous maintenant.");
      setMode("login");
      setPassword("");
    } catch (error) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  // Fonction de réinitialisation mot de passe
  async function handleForgotPassword() {
    setForgotLoading(true);
    setForgotMessage("");
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMessage(data.message || "Email envoyé !");
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setForgotLoading(false);
    }
  }

  // Vérification du code 2FA
  async function handle2FAVerify() {
    setTwoFactorLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: twoFactorCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Code invalide");
        return;
      }

      // Connexion réussie
      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("user_email", data.email);
      onLogin(data.token, data.email);
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setTwoFactorLoading(false);
    }
  }

  // =====================
  // RENDU
  // =====================

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "2.5rem",
          width: "380px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid #eee",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        {/* Logo / Titre */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📊</div>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "#111" }}>Project Manager</div>
          <div style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
            {show2FA
              ? "Vérification en deux étapes"
              : mode === "login"
                ? "Connectez-vous à votre compte"
                : "Créez votre compte"}
          </div>
        </div>

        {/* Onglets Login / Register — cachés en mode 2FA et forgot */}
        {!show2FA && mode !== "forgot" && (
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
        )}

        {/* Mode 2FA — saisie du code reçu par email */}
        {show2FA && (
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Un code a été envoyé à <strong>{email}</strong>
            </div>

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
                ❌ {error}
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "6px",
                }}
              >
                Code à 6 chiffres
              </div>
              <input
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handle2FAVerify()}
                style={{
                  width: "100%",
                  fontSize: "24px",
                  fontWeight: "600",
                  letterSpacing: "8px",
                  textAlign: "center",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              onClick={handle2FAVerify}
              disabled={twoFactorLoading || twoFactorCode.length !== 6}
              style={{
                width: "100%",
                padding: "12px",
                background: twoFactorLoading || twoFactorCode.length !== 6 ? "#aaa" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: twoFactorLoading || twoFactorCode.length !== 6 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "12px",
              }}
            >
              {twoFactorLoading ? "Vérification..." : "Vérifier le code"}
            </button>

            <div
              onClick={() => {
                setShow2FA(false);
                setTwoFactorCode("");
                setError("");
              }}
              style={{
                fontSize: "12px",
                color: "#aaa",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              ← Retour à la connexion
            </div>
          </div>
        )}

        {/* Mode mot de passe oublié */}
        {!show2FA && mode === "forgot" && (
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Entrez votre email pour recevoir un lien de réinitialisation
            </div>

            {forgotMessage && (
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
                ✅ {forgotMessage}
              </div>
            )}

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
                ❌ {error}
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "6px",
                }}
              >
                Email
              </div>
              <input
                type="email"
                placeholder="votre@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
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

            <button
              onClick={handleForgotPassword}
              disabled={forgotLoading || !forgotEmail}
              style={{
                width: "100%",
                padding: "12px",
                background: forgotLoading || !forgotEmail ? "#aaa" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: forgotLoading || !forgotEmail ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "12px",
              }}
            >
              {forgotLoading ? "Envoi..." : "📧 Envoyer le lien"}
            </button>

            <div
              onClick={() => setMode("login")}
              style={{
                fontSize: "12px",
                color: "#aaa",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              ← Retour à la connexion
            </div>
          </div>
        )}

        {/* Message de succès */}
        {!show2FA && message && (
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
        {!show2FA && error && (
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
        {!show2FA && mode !== "forgot" && (
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                marginBottom: "6px",
              }}
            >
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
        )}

        {/* Champ mot de passe */}
        {!show2FA && mode !== "forgot" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                marginBottom: "6px",
              }}
            >
              Mot de passe
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())
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
        )}

        {/* Boutons OAuth */}
        {!show2FA && mode === "login" && (
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#aaa",
                marginBottom: "10px",
              }}
            >
              ou continuer avec
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <a
                hrref="https://api.costincianu.fr/api/auth/github"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111",
                  textDecoration: "none",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>

              <a
                hrref="https://api.costincianu.fr/api/auth/google"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111",
                  textDecoration: "none",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </a>
            </div>
          </div>
        )}

        {/* Lien mot de passe oublié */}
        {!show2FA && mode === "login" && (
          <div
            onClick={() => setMode("forgot")}
            style={{
              fontSize: "12px",
              color: "#aaa",
              textAlign: "right",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            Mot de passe oublié ?
          </div>
        )}

        {/* Bouton principal */}
        {!show2FA && mode !== "forgot" && (
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
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        )}
      </div>
    </div>
  );
}

export default PageAuth;
