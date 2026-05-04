function TaskItem({ task, projectName, onToggle, onDelete, onEdit }) {

  // =====================
  // CALCUL DE LA DATE D'ÉCHÉANCE
  // =====================

  // On vérifie si la tâche a une date d'échéance
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // On convertit la date d'échéance en objet Date
  const due = task.dueDate ? new Date(task.dueDate) : null

  // On calcule le nombre de jours restants
  const daysLeft = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null

  // On détermine la couleur selon l'urgence
  function getDueDateColor() {
    if (!due || task.done) return "#bbb"
    if (daysLeft < 0) return "#e74c3c"   // En retard — rouge
    if (daysLeft <= 3) return "#e67e22"  // Urgent — orange
    return "#aaa"                         // Normal — gris
  }

  // On formate le texte de la date
  function getDueDateText() {
    if (!due) return null
    if (task.done) return due.toLocaleDateString("fr-FR")
    if (daysLeft < 0) return `En retard de ${Math.abs(daysLeft)}j`
    if (daysLeft === 0) return "Aujourd'hui !"
    if (daysLeft === 1) return "Demain"
    return `Dans ${daysLeft}j`
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid #f0f0f0",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
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
          marginTop: "1px",
        }}
      >
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

      {/* Infos de la tâche */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "13px",
          color: task.done ? "#aaa" : "#222",
          textDecoration: task.done ? "line-through" : "none",
        }}>
          {task.name}
        </div>

        {/* Projet + date d'échéance */}
        <div style={{ display: "flex", gap: "8px", marginTop: "2px", alignItems: "center" }}>
          <div style={{ fontSize: "11px", color: "#aaa" }}>{projectName}</div>
          {getDueDateText() && (
            <div style={{
              fontSize: "10px",
              color: getDueDateColor(),
              fontWeight: daysLeft !== null && daysLeft <= 3 && !task.done ? "500" : "400",
            }}>
              · {getDueDateText()}
            </div>
          )}
        </div>
      </div>

      {/* Badge priorité */}
      <div style={{
        fontSize: "10px",
        padding: "2px 7px",
        borderRadius: "20px",
        background: task.priority === "haute" ? "#FCEBEB"
          : task.priority === "moyenne" ? "#FAEEDA"
          : "#EAF3DE",
        color: task.priority === "haute" ? "#A32D2D"
          : task.priority === "moyenne" ? "#854F0B"
          : "#3B6D11",
      }}>
        {task.priority}
      </div>

      {/* Bouton modifier */}
      <div
        onClick={() => onEdit(task)}
        style={{
          fontSize: "14px",
          color: "#ddd",
          cursor: "pointer",
          padding: "0 4px",
          transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#378ADD"}
        onMouseLeave={e => e.currentTarget.style.color = "#ddd"}
        title="Modifier la tâche"
      >
        ✎
      </div>

      {/* Bouton supprimer */}
      <div
        onClick={() => onDelete(task.id)}
        style={{
          fontSize: "16px",
          color: "#ddd",
          cursor: "pointer",
          lineHeight: 1,
          padding: "0 4px",
          transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#e74c3c"}
        onMouseLeave={e => e.currentTarget.style.color = "#ddd"}
        title="Supprimer la tâche"
      >
        ✕
      </div>

    </div>
  )
}

export default TaskItem