function Sidebar({
  activePage,
  onNavigate,
  darkMode,
  onToggleDark,
  userEmail,
  onLogout,
}) {
  // Liste des éléments du menu de navigation
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

  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        background: darkMode ? "#000" : "#111",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        flexShrink: 0,
      }}
    >
      {/* Logo / Titre */}
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

      {/* Liens de navigation */}
      {menuItems.map((item) => (
        <div
          key={item.id}
          onClick={() => onNavigate(item.id)}
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

      {/* Partie basse de la sidebar */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* Email de l'utilisateur connecté */}
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

        {/* Bouton mode sombre */}
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

        {/* Bouton déconnexion */}
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
  );
}

export default Sidebar;
