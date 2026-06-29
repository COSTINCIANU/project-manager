function ProjectCard({ project }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 8px",
        borderBottom: "1px solid #f0f0f0",
        borderRadius: "8px",
        // Transition pour le hover
        transition: "background 0.15s",
        cursor: "default",
      }}
      // Effet hover — change le fond au survol
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Point coloré représentant le projet */}
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: project.color,
          flexShrink: 0,
        }}
      />

      {/* Infos du projet */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
          {project.name}
        </div>

        {/* Barre de progression */}
        <div
          style={{
            height: "4px",
            background: "#eee",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${project.progress}%`,
              background: project.color,
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Pourcentage */}
        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
          {project.progress}% complété
        </div>
      </div>

      {/* Badge statut */}
      <div
        style={{
          fontSize: "11px",
          padding: "3px 10px",
          borderRadius: "20px",
          fontWeight: "500",
          background:
            project.status === "Terminé"
              ? "#EAF3DE"
              : project.status === "En attente"
                ? "#FAEEDA"
                : "#E6F1FB",
          color:
            project.status === "Terminé"
              ? "#3B6D11"
              : project.status === "En attente"
                ? "#854F0B"
                : "#185FA5",
        }}
      >
        {project.status}
      </div>
    </div>
  );
}

export default ProjectCard;
