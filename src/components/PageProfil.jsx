// =====================================================
// PageProfil.jsx — Page de profil utilisateur
// Permet de modifier le nom, rôle et mot de passe
// =====================================================
import { useState, useEffect } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";

function PageProfil({ userEmail }) {
  // =====================
  // ÉTATS
  // =====================
  const [name, setName] = useState("");
  const [role, setRole] = useState("dev");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 2FA — état activé ou non
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Hook pour les notifications push
  const {
    isSubscribed,
    isSupported,
    loading: pushLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // =====================
  // CHARGEMENT DU PROFIL
  // =====================
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        });
        const data = await res.json();
        if (data) {
          setProfile(data);
          setName(data.name || "");
          setRole(data.role || "dev");
          setTwoFactorEnabled(data.twoFactorEnabled || false);
        }
      } catch (err) {
        console.error("Erreur chargement profil :", err);
      }
    }
    loadProfile();
  }, []);

  // =====================
  // SAUVEGARDE DU PROFIL
  // =====================
  async function handleSave() {
    setError("");
    setMessage("");

    if (password && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);

    try {
      const body = { name, role };
      if (password) body.password = password;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour");
        return;
      }

      setMessage("Profil mis à jour avec succès !");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // UPLOAD AVATAR
  // =====================
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Prévisualisation locale
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.avatar) {
        setProfile({ ...profile, avatar: data.avatar });
        setMessage("Avatar mis à jour !");
      }
    } catch (err) {
      setError("Erreur lors de l'upload de l'avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // =====================
  //  ACTIVER / DESACTIVER LE 2FA
  // =====================
  async function handleToggle2FA() {
    setTwoFactorLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/2fa/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
          body: JSON.stringify({
            email: userEmail,
            enabled: !twoFactorEnabled,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(!twoFactorEnabled);
        setMessage(data.message);
      }
    } catch (err) {
      setError("Erreur lors de la modification du 2FA");
    } finally {
      setTwoFactorLoading(false);
    }
  }

  // =====================
  // COULEUR DU RÔLE
  // =====================
  function getRoleStyle(r) {
    switch (r) {
      case "admin":
        return { bg: "#FCEBEB", color: "#A32D2D" };
      case "manager":
        return { bg: "#FAEEDA", color: "#854F0B" };
      case "dev":
        return { bg: "#E8F4FD", color: "#1976D2" };
      case "client":
        return { bg: "#EAF3DE", color: "#3B6D11" };
      default:
        return { bg: "#f0f0f0", color: "#666" };
    }
  }

  const roleStyle = getRoleStyle(role);

  // =====================
  // RENDU
  // =====================
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* ---- CARTE PROFIL ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        {/* Avatar et infos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "1.5rem",
          }}
        >
          {/* Avatar cliquable */}
          <label style={{ cursor: "pointer", position: "relative" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "#fff",
                fontWeight: "600",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {avatarPreview || profile?.avatar ? (
                <img
                  src={
                    avatarPreview ||
                    `https://api.costincianu.fr${profile.avatar}`
                  }
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                (name || userEmail || "?")[0].toUpperCase()
              )}
            </div>
            {/* Overlay au survol */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                fontSize: "18px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
            >
              📷
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: "none" }}
              disabled={uploadingAvatar}
            />
          </label>

          <div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>
              {name || userEmail}
            </div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "2px" }}>
              {userEmail}
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              {uploadingAvatar
                ? "Upload en cours..."
                : "Cliquez sur la photo pour changer"}
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: "6px",
                fontSize: "11px",
                padding: "2px 10px",
                borderRadius: "20px",
                background: roleStyle.bg,
                color: roleStyle.color,
                fontWeight: "500",
              }}
            >
              {role}
            </div>
          </div>
        </div>

        {/* Messages */}
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
            ✅ {message}
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

        {/* Champ nom */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
            Nom affiché
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom..."
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

        {/* Champ rôle */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
            Rôle
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              fontSize: "13px",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            <option value="admin">👑 Admin</option>
            <option value="manager">📋 Manager</option>
            <option value="dev">💻 Développeur</option>
            <option value="client">👤 Client</option>
          </select>
        </div>

        {/* Champ mot de passe */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
            Nouveau mot de passe (laisser vide pour ne pas changer)
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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

        {/* Confirmer mot de passe */}
        {password && (
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}
            >
              Confirmer le mot de passe
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                fontSize: "13px",
                padding: "10px 12px",
                border: `1px solid ${confirmPassword && password !== confirmPassword ? "#e74c3c" : "#ddd"}`,
                borderRadius: "8px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Bouton sauvegarder */}
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#aaa" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          {loading ? "Sauvegarde..." : "💾 Sauvegarder le profil"}
        </button>
      </div>

      {/* ---- SÉCURITÉ 2FA ---- */}
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
          🔐 Sécurité — Double authentification
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", color: "#333", fontWeight: "500" }}>
              Authentification par email
            </div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>
              Un code à 6 chiffres sera envoyé à chaque connexion
            </div>
          </div>
          <button
            onClick={handleToggle2FA}
            disabled={twoFactorLoading}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: twoFactorLoading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "500",
              background: twoFactorEnabled ? "#FCEBEB" : "#EAF3DE",
              color: twoFactorEnabled ? "#A32D2D" : "#3B6D11",
            }}
          >
            {twoFactorLoading
              ? "..."
              : twoFactorEnabled
                ? "Désactiver"
                : "Activer"}
          </button>
        </div>
      </div>

      {/* ---- NOTIFICATIONS PUSH ---- */}
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
          🔔 Notifications push
        </div>
        {!isSupported ? (
          <div style={{ fontSize: "13px", color: "#aaa" }}>
            Votre navigateur ne supporte pas les notifications push
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{ fontSize: "13px", color: "#333", fontWeight: "500" }}
              >
                Notifications navigateur
              </div>
              <div
                style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}
              >
                Recevez des alertes même quand l'app est fermée
              </div>
            </div>
            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={pushLoading}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: pushLoading ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "500",
                background: isSubscribed ? "#FCEBEB" : "#EAF3DE",
                color: isSubscribed ? "#A32D2D" : "#3B6D11",
              }}
            >
              {pushLoading ? "..." : isSubscribed ? "Désactiver" : "Activer"}
            </button>
          </div>
        )}
      </div>

      {/* ---- INFORMATIONS DU COMPTE ---- */}
      {profile && (
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
            ℹ️ Informations du compte
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "#aaa" }}>Email</span>
              <span style={{ color: "#333" }}>{profile.email}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "#aaa" }}>Membre depuis</span>
              <span style={{ color: "#333" }}>
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("fr-FR")
                  : "—"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "#aaa" }}>Rôle actuel</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 10px",
                  borderRadius: "20px",
                  background: roleStyle.bg,
                  color: roleStyle.color,
                  fontWeight: "500",
                }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PageProfil;
