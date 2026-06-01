// =====================================================
// TaskItem.jsx — Composant d'affichage d'une tâche
// Affiche une tâche avec tous ses détails :
// nom, priorité, date d'échéance, tags, sous-tâches
// et les boutons modifier/supprimer
// =====================================================

function TaskItem({ task, projectName, onToggle, onDelete, onEdit, users }) {
  // =====================
  // CALCUL DE LA DATE D'ÉCHÉANCE
  // =====================

  // Date du jour sans l'heure pour une comparaison correcte
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // On convertit la date d'échéance en objet Date si elle existe
  const due = task.dueDate ? new Date(task.dueDate) : null;

  // Nombre de jours restants avant l'échéance
  const daysLeft = due
    ? Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    : null;

  // Couleur selon l'urgence de la date d'échéance
  function getDueDateColor() {
    if (!due || task.done) return "#bbb";
    if (daysLeft < 0) return "#e74c3c"; // En retard — rouge
    if (daysLeft <= 3) return "#e67e22"; // Urgent — orange
    return "#aaa"; // Normal — gris
  }

  // Texte affiché pour la date d'échéance
  function getDueDateText() {
    if (!due) return null;
    if (task.done) return due.toLocaleDateString("fr-FR");
    if (daysLeft < 0) return `En retard de ${Math.abs(daysLeft)}j`;
    if (daysLeft === 0) return "Aujourd'hui !";
    if (daysLeft === 1) return "Demain";
    return `Dans ${daysLeft}j`;
  }

  // =====================
  // CALCUL DES SOUS-TÂCHES
  // =====================

  // Nombre de sous-tâches terminées / total
  const subTasks = task.subTasks || [];
  const subTasksDone = subTasks.filter((st) => st.done).length;
  const subTasksTotal = subTasks.length;

  // Pourcentage de complétion des sous-tâches
  const subTasksPercent =
    subTasksTotal > 0 ? Math.round((subTasksDone / subTasksTotal) * 100) : 0;

  // =====================
  // COULEUR DE LA PRIORITÉ
  // =====================

  // Couleur du badge selon la priorité
  function getPriorityStyle() {
    switch (task.priority) {
      case "critique":
        return { bg: "#FCEBEB", color: "#A32D2D" };
      case "haute":
        return { bg: "#FAEEDA", color: "#854F0B" };
      case "normale":
        return { bg: "#E8F4FD", color: "#1976D2" };
      case "basse":
        return { bg: "#EAF3DE", color: "#3B6D11" };
      default:
        return { bg: "#f0f0f0", color: "#666" };
    }
  }

  const priorityStyle = getPriorityStyle();

  // =====================
  // FORMATAGE DU TEMPS ESTIMÉ
  // =====================

  // Convertit les minutes en format lisible ex: 90 → "1h30"
  function formatTime(minutes) {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  }

  // =====================
  // RENDU DU COMPOSANT
  // =====================

  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: "1px solid #f0f0f0",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* ---- LIGNE PRINCIPALE ---- */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {/* Case à cocher */}
        <div
          onClick={() => onToggle(task.id)}
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            border: task.done ? "none" : "1.5px solid #ccc",
            background: task.done ? "#639922" : "transparent",
            flexShrink: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "2px",
          }}
        >
          {/* Icône coche si tâche terminée */}
          {task.done && (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polyline
                points="1.5,5 4,7.5 8.5,2.5"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* ---- INFOS DE LA TÂCHE ---- */}
        <div style={{ flex: 1 }}>
          {/* Nom de la tâche */}
          <div
            style={{
              fontSize: "13px",
              color: task.done ? "#aaa" : "#222",
              textDecoration: task.done ? "line-through" : "none",
            }}
          >
            {task.name}
          </div>

          {/* Description courte si elle existe */}
          {task.description && (
            <div
              style={{
                fontSize: "11px",
                color: "#aaa",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "300px",
              }}
            >
              {task.description}
            </div>
          )}

          {/* ---- LIGNE MÉTADONNÉES ---- */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "4px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Nom du projet */}
            <div style={{ fontSize: "11px", color: "#aaa" }}>{projectName}</div>

            {/* Date d'échéance */}
            {getDueDateText() && (
              <div
                style={{
                  fontSize: "10px",
                  color: getDueDateColor(),
                  fontWeight:
                    daysLeft !== null && daysLeft <= 3 && !task.done
                      ? "500"
                      : "400",
                }}
              >
                📅 {getDueDateText()}
              </div>
            )}

            {/* Temps estimé */}
            {task.estimatedTime && (
              <div style={{ fontSize: "10px", color: "#aaa" }}>
                ⏱ {formatTime(task.estimatedTime)}
              </div>
            )}

            {/* Progression des sous-tâches */}
            {subTasksTotal > 0 && (
              <div style={{ fontSize: "10px", color: "#aaa" }}>
                ✅ {subTasksDone}/{subTasksTotal} sous-tâches
              </div>
            )}
          </div>

          {/* Assigné à */}
          {task.assignedTo && (
            <div style={{ fontSize: "10px", color: "#aaa" }}>
              👤{" "}
              {Array.isArray(users)
                ? users.find((u) => u.id === task.assignedTo)?.email ||
                  "Inconnu"
                : "Inconnu"}
            </div>
          )}

          {/* ---- BARRE DE PROGRESSION SOUS-TÂCHES ---- */}
          {subTasksTotal > 0 && (
            <div
              style={{
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* Barre de progression */}
              <div
                style={{
                  height: "6px",
                  background: "#f0f0f0",
                  borderRadius: "4px",
                  width: "120px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${subTasksPercent}%`,
                    background: subTasksPercent === 100 ? "#639922" : "#378ADD",
                    borderRadius: "4px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              {/* Pourcentage */}
              <span style={{ fontSize: "10px", color: "#aaa" }}>
                {subTasksPercent}%
              </span>
            </div>
          )}

          {/* ---- TAGS ---- */}
          {task.tags && task.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "4px",
                marginTop: "5px",
                flexWrap: "wrap",
              }}
            >
              {task.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "10px",
                    padding: "1px 7px",
                    borderRadius: "20px",
                    background: "#f0f0f0",
                    color: "#666",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ---- BADGE PRIORITÉ ---- */}
        <div
          style={{
            fontSize: "10px",
            padding: "2px 7px",
            borderRadius: "20px",
            background: priorityStyle.bg,
            color: priorityStyle.color,
            flexShrink: 0,
          }}
        >
          {task.priority}
        </div>

        {/* ---- BOUTON MODIFIER ---- */}
        <div
          onClick={() => onEdit(task)}
          style={{
            fontSize: "14px",
            color: "#ddd",
            cursor: "pointer",
            padding: "0 4px",
            transition: "color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#378ADD")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
          title="Modifier la tâche"
        >
          ✎
        </div>

        {/* ---- BOUTON SUPPRIMER ---- */}
        <div
          onClick={() => onDelete(task.id)}
          style={{
            fontSize: "16px",
            color: "#ddd",
            cursor: "pointer",
            lineHeight: 1,
            padding: "0 4px",
            transition: "color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e74c3c")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
          title="Supprimer la tâche"
        >
          ✕
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
