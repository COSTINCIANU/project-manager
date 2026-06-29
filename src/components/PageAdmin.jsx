// =====================================================
// PageAdmin.jsx — Dashboard Admin
// Gère les utilisateurs et abonnements
// Accessible uniquement aux administrateurs
// =====================================================
import { useState, useEffect } from "react";

function PageAdmin() {
  // =====================
  // ÉTATS
  // =====================
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =====================
  // CHARGEMENT DES DONNÉES
  // =====================
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
      };

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/admin/users`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      if (statsRes.ok) setStats(statsData);
      if (usersRes.ok) setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Erreur chargement admin :", err);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // MODIFIER LE PLAN
  // =====================
  async function handlePlanChange(userId, plan) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, plan } : u)));
        setMessage("Plan mis à jour !");
        setTimeout(() => setMessage(""), 3000);
        loadData();
      }
    } catch (err) {
      console.error("Erreur plan :", err);
    }
  }

  // =====================
  // ACTIVER/DÉSACTIVER UN UTILISATEUR
  // =====================
  async function handleToggle(userId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/toggle`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });

      if (res.ok) {
        loadData();
        setMessage("Statut mis à jour !");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Erreur toggle :", err);
    }
  }

  // =====================
  // SUPPRIMER UN UTILISATEUR
  // =====================
  async function handleDelete(userId, email) {
    if (!confirm(`Supprimer l'utilisateur ${email} ?`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        setMessage("Utilisateur supprimé !");
        setTimeout(() => setMessage(""), 3000);
        loadData();
      }
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  }

  // =====================
  // COULEUR DU PLAN
  // =====================
  function getPlanColor(plan) {
    switch (plan) {
      case "pro":
        return { bg: "#E8F4FD", color: "#1565C0" };
      case "enterprise":
        return { bg: "#F3E8FF", color: "#6B21A8" };
      default:
        return { bg: "#f0f0f0", color: "#666" };
    }
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Chargement...</div>;
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* ---- EN-TÊTE ---- */}
      <div style={{ fontSize: "18px", fontWeight: "600", color: "#111" }}>🛡️ Dashboard Admin</div>

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

      {/* ---- STATISTIQUES ---- */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
          }}
        >
          {[
            {
              label: "Utilisateurs",
              value: stats.totalUsers,
              icon: "👥",
              color: "#378ADD",
            },
            {
              label: "Actifs",
              value: stats.activeUsers,
              icon: "✅",
              color: "#639922",
            },
            {
              label: "Plan Pro",
              value: stats.planCounts.pro,
              icon: "⭐",
              color: "#1565C0",
            },
            {
              label: "Revenus/mois",
              value: `${stats.monthlyRevenue}€`,
              icon: "💰",
              color: "#9B7FD4",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: stat.color,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "11px", color: "#aaa" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ---- LISTE UTILISATEURS ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}>
          👤 Utilisateurs ({users.length})
        </div>

        {users.length === 0 ? (
          <div
            style={{
              fontSize: "13px",
              color: "#aaa",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            Aucun utilisateur
          </div>
        ) : (
          users.map((user) => {
            const planStyle = getPlanColor(user.plan);
            return (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #f5f5f5",
                  opacity: user.isActive ? 1 : 0.5,
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {/* Infos utilisateur */}
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#222",
                      fontWeight: "500",
                    }}
                  >
                    {user.email}
                    {user.roles.includes("ROLE_ADMIN") && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#e74c3c",
                          marginLeft: "6px",
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                    {!user.isActive && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#aaa",
                          marginLeft: "6px",
                        }}
                      >
                        Désactivé
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Sélecteur de plan */}
                  <select
                    value={user.plan}
                    onChange={(e) => handlePlanChange(user.id, e.target.value)}
                    style={{
                      fontSize: "11px",
                      padding: "4px 8px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      background: planStyle.bg,
                      color: planStyle.color,
                      fontWeight: "500",
                      outline: "none",
                    }}
                  >
                    <option value="free">Gratuit</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Entreprise</option>
                  </select>

                  {/* Toggle actif/inactif */}
                  <button
                    onClick={() => handleToggle(user.id)}
                    style={{
                      padding: "4px 10px",
                      background: user.isActive ? "#FCEBEB" : "#EAF3DE",
                      color: user.isActive ? "#A32D2D" : "#3B6D11",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                    }}
                  >
                    {user.isActive ? "Désactiver" : "Activer"}
                  </button>

                  {/* Supprimer */}
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    style={{
                      padding: "4px 10px",
                      background: "#f0f0f0",
                      color: "#888",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PageAdmin;
