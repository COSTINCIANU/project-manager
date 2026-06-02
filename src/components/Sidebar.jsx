// =====================================================
// Sidebar.jsx — Navigation principale
// Responsive : hamburger sur mobile, sidebar sur desktop
// =====================================================
import { useState } from "react";

function Sidebar({
  activePage,
  onNavigate,
  darkMode,
  onToggleDark,
  userEmail,
  onLogout,
}) {
  // État pour afficher/masquer la sidebar sur mobile
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
    { id: "ia", label: "Assistant IA", icon: "🤖" },
    { id: "profil", label: "Mon profil", icon: "👤" },
  ];

  // Fonction pour naviguer et fermer la sidebar sur mobile
  function handleNavigate(id) {
    onNavigate(id);
    setIsOpen(false);
  }

  return (
    <>
      {/* ---- BOUTON HAMBURGER (mobile uniquement) ---- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        className="hamburger-btn"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* ---- OVERLAY (mobile uniquement) ---- */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
          style={{
            display: "none",
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
        className="sidebar"
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
        }}
      >
        {/* Logo */}
        <div
          style={{
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "2rem",
            paddingLeft: "10px",
          }}
        >
          Project Manager
        </div>

        {/* Menu items */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavigate(item.id)}
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
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Partie basse */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Email utilisateur */}
          {userEmail && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#222",
                marginBottom: "4px",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#aaa",
              fontSize: "14px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: "16px" }}>{darkMode ? "☀" : "☾"}</span>
            {darkMode ? "Mode clair" : "Mode sombre"}
          </div>

          {/* Déconnexion */}
          <div
            onClick={onLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#e74c3c",
              fontSize: "14px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: "16px" }}>⏻</span>
            Déconnexion
          </div>
        </div>
      </div>

      {/* ---- CSS RESPONSIVE ---- */}
      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn {
            display: flex !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
          .sidebar {
            position: fixed !important;
            top: 0 !important;
            left: ${isOpen ? "0" : "-240px"} !important;
            height: 100vh !important;
            transition: left 0.3s ease !important;
            overflow-y: auto !important;
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;
