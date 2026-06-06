// =====================================================
// Sidebar.jsx — Navigation principale
// Mobile : hamburger | Tablette : icônes | Desktop : complet
// =====================================================
import { useState } from "react";

function Sidebar({
  activePage,
  onNavigate,
  darkMode,
  onToggleDark,
  userEmail,
  onLogout,
  unreadMentions,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "projets", label: "Projets", icon: "◈" },
    { id: "taches", label: "Tâches", icon: "✓" },
    { id: "kanban", label: "Kanban", icon: "▤" },
    { id: "invitations", label: "Invitations", icon: "✉️" },
    { id: "liste", label: "Vue Liste", icon: "☰" },
    { id: "calendrier", label: "Calendrier", icon: "📅" },
    { id: "gantt", label: "Vue Gantt", icon: "📊" },
    { id: "stats", label: "Statistiques", icon: "▲" },
    { id: "rapport", label: "Rapport PDF", icon: "📄" },
    { id: "github", label: "GitHub", icon: "🐙" },
    { id: "historique", label: "Historique", icon: "📋" },
    { id: "activite", label: "Activité", icon: "⚡" },
    { id: "ia", label: "Assistant IA", icon: "🤖" },
    { id: "profil", label: "Mon profil", icon: "👤" },
  ];

  function handleNavigate(id) {
    onNavigate(id);
    setIsOpen(false);
  }

  return (
    <>
      {/* ---- BOUTON HAMBURGER (mobile uniquement) ---- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hamburger-btn"
        style={{
          display: "none",
          position: "fixed",
          top: "12px",
          left: "12px",
          zIndex: 1001,
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          width: "40px",
          height: "40px",
          fontSize: "18px",
          cursor: "pointer",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* ---- OVERLAY MOBILE ---- */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* ---- SIDEBAR ---- */}
      <div
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{
          width: "220px",
          minHeight: "100vh",
          background: darkMode ? "#000" : "#111",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          flexShrink: 0,
          zIndex: 1000,
          transition: "width 0.3s",
        }}
      >
        {/* Logo */}
        <div
          className="sidebar-logo"
          style={{
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "2rem",
            paddingLeft: "10px",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          Project Manager
        </div>

        {/* Menu items */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className="sidebar-item"
              title={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                background: activePage === item.id ? "#fff" : "transparent",
                color: activePage === item.id ? "#111" : "#aaa",
                fontSize: "14px",
                fontWeight: activePage === item.id ? "500" : "400",
                transition: "all 0.15s",
                marginBottom: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (activePage !== item.id)
                  e.currentTarget.style.background = "#222";
              }}
              onMouseLeave={(e) => {
                if (activePage !== item.id)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>
                {item.icon}
              </span>
              <span className="sidebar-label" style={{ flex: 1 }}>
                {item.label}
              </span>
              {/* Badge mentions non lues sur l'item invitations */}
              {item.id === "invitations" && unreadMentions > 0 && (
                <span
                  style={{
                    background: "#e74c3c",
                    color: "#fff",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "600",
                    padding: "1px 6px",
                    minWidth: "18px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {unreadMentions}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Partie basse */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Email */}
          {userEmail && (
            <div
              className="sidebar-email"
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#222",
                marginBottom: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{ fontSize: "10px", color: "#666", marginBottom: "2px" }}
              >
                Connecté en tant que
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#aaa",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userEmail}
              </div>
            </div>
          )}

          {/* Mode sombre */}
          <div
            onClick={onToggleDark}
            title={darkMode ? "Mode clair" : "Mode sombre"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#aaa",
              fontSize: "14px",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>
              {darkMode ? "☀" : "☾"}
            </span>
            <span className="sidebar-label">
              {darkMode ? "Mode clair" : "Mode sombre"}
            </span>
          </div>

          {/* Déconnexion */}
          <div
            onClick={onLogout}
            title="Déconnexion"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#e74c3c",
              fontSize: "14px",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>⏻</span>
            <span className="sidebar-label">Déconnexion</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
