// =====================================================
// PageVueGantt.jsx — Vue Gantt des tâches
// Affiche les tâches sous forme de barres horizontales
// sur une timeline mensuelle
// =====================================================
import { useState } from "react";

function PageVueGantt({ tasks, projects }) {
  // =====================
  // ÉTATS
  // =====================

  // Mois affiché — par défaut le mois actuel
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filtre par projet
  const [filterProject, setFilterProject] = useState("tous");

  // =====================
  // CALCULS DE LA TIMELINE
  // =====================

  // Année et mois affichés
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Nombre de jours dans le mois
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Tableau des jours du mois [1, 2, 3, ...]
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Nom du mois en français
  const monthName = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  // =====================
  // FONCTIONS
  // =====================

  // Trouve le nom du projet par son id
  function getProjectName(projectId) {
    if (!Array.isArray(projects)) return "Inconnu";
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Inconnu";
  }

  // Mois précédent
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  // Mois suivant
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Calcule la position et largeur de la barre Gantt
  // pour une tâche donnée
  function getBarStyle(task) {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const dueYear = dueDate.getFullYear();
    const dueMonth = dueDate.getMonth();
    const dueDay = dueDate.getDate();

    // La tâche n'est pas dans ce mois
    if (dueYear !== year || dueMonth !== month) return null;

    // Position de fin (date d'échéance)
    const endDay = dueDay;

    // Position de début — on suppose que la tâche commence
    // soit au début du mois soit 7 jours avant l'échéance
    const startDay = Math.max(1, endDay - 6);

    // Calcul en pourcentage
    const left = ((startDay - 1) / daysInMonth) * 100;
    const width = ((endDay - startDay + 1) / daysInMonth) * 100;

    return { left: `${left}%`, width: `${width}%` };
  }

  // Couleur de la barre selon priorité et statut
  function getBarColor(task) {
    if (task.done) return "#639922";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (task.dueDate && new Date(task.dueDate) < today) return "#e74c3c";
    switch (task.priority) {
      case "critique":
        return "#e74c3c";
      case "haute":
        return "#e67e22";
      case "normale":
        return "#378ADD";
      case "basse":
        return "#95a5a6";
      default:
        return "#378ADD";
    }
  }

  // =====================
  // FILTRAGE
  // =====================

  // Tâches avec date d'échéance dans ce mois
  const filteredTasks = Array.isArray(tasks)
    ? tasks
        .filter((t) => (filterProject === "tous" ? true : t.projectId === parseInt(filterProject)))
        .filter((t) => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          return d.getFullYear() === year && d.getMonth() === month;
        })
    : [];

  // =====================
  // RENDU
  // =====================

  return (
    <div
      className="gantt-container"
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "1.25rem",
        overflowX: "auto",
      }}
    >
      {/* ---- EN-TÊTE ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* Navigation mois */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={prevMonth}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              background: "#fff",
              fontSize: "14px",
            }}
          >
            ←
          </button>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "500",
              textTransform: "capitalize",
            }}
          >
            {monthName}
          </div>
          <button
            onClick={nextMonth}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              background: "#fff",
              fontSize: "14px",
            }}
          >
            →
          </button>
        </div>

        {/* Filtre projet */}
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={{
            fontSize: "12px",
            padding: "6px 8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            color: "#666",
          }}
        >
          <option value="tous">Tous projets</option>
          {Array.isArray(projects) &&
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>

        {/* Compteur */}
        <div style={{ fontSize: "12px", color: "#aaa" }}>
          {filteredTasks.length} tâche{filteredTasks.length !== 1 ? "s" : ""} ce mois
        </div>
      </div>

      {/* ---- GRILLE GANTT ---- */}
      <div style={{ minWidth: "400px" }}>
        {/* En-tête des jours */}
        <div style={{ display: "flex", marginBottom: "4px", paddingLeft: "200px" }}>
          {days.map((day) => {
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;
            const isWeekend =
              new Date(year, month, day).getDay() === 0 ||
              new Date(year, month, day).getDay() === 6;

            return (
              <div
                key={day}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: "10px",
                  color: isToday ? "#378ADD" : isWeekend ? "#ccc" : "#aaa",
                  fontWeight: isToday ? "700" : "400",
                  padding: "2px 0",
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Ligne aujourd'hui */}
        {new Date().getMonth() === month && new Date().getFullYear() === year && (
          <div
            style={{
              position: "relative",
              height: "0",
              marginLeft: "200px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${((new Date().getDate() - 1) / daysInMonth) * 100}%`,
                top: 0,
                bottom: 0,
                width: "1px",
                background: "#378ADD",
                opacity: 0.5,
                zIndex: 1,
              }}
            />
          </div>
        )}

        {/* Tâches */}
        {filteredTasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#aaa",
              fontSize: "13px",
              padding: "3rem 0",
            }}
          >
            Aucune tâche avec échéance ce mois
          </div>
        ) : (
          filteredTasks.map((task, index) => {
            const barStyle = getBarStyle(task);
            const barColor = getBarColor(task);

            return (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "6px",
                  background: index % 2 === 0 ? "#f0f0f0" : "#fff",
                  borderRadius: "6px",
                  padding: "4px 0",
                }}
              >
                {/* Nom de la tâche */}
                <div
                  style={{
                    width: "120px",
                    flexShrink: 0,
                    paddingRight: "12px",
                    paddingLeft: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: task.done ? "#aaa" : "#222",
                      textDecoration: task.done ? "line-through" : "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    {getProjectName(task.projectId)}
                  </div>
                </div>

                {/* Barre Gantt */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    height: "28px",
                  }}
                >
                  {/* Fond de la ligne avec grille */}
                  {days.map((day) => {
                    const isWeekend =
                      new Date(year, month, day).getDay() === 0 ||
                      new Date(year, month, day).getDay() === 6;
                    return (
                      <div
                        key={day}
                        style={{
                          position: "absolute",
                          left: `${((day - 1) / daysInMonth) * 100}%`,
                          width: `${(1 / daysInMonth) * 100}%`,
                          height: "100%",
                          background: isWeekend ? "rgba(0,0,0,0.06)" : "transparent",
                          borderLeft: "1px solid #f5f5f5",
                        }}
                      />
                    );
                  })}

                  {/* Barre de la tâche */}
                  {barStyle && (
                    <div
                      style={{
                        position: "absolute",
                        left: barStyle.left,
                        width: barStyle.width,
                        height: "20px",
                        top: "4px",
                        background: barColor,
                        borderRadius: "4px",
                        opacity: task.done ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "6px",
                        overflow: "hidden",
                        zIndex: 2,
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                      title={`${task.name} — échéance: ${new Date(task.dueDate).toLocaleDateString("fr-FR")}`}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "white",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {task.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---- LÉGENDE ---- */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #f0f0f0",
          flexWrap: "wrap",
        }}
      >
        {[
          { color: "#e74c3c", label: "Critique / En retard" },
          { color: "#e67e22", label: "Haute" },
          { color: "#378ADD", label: "Normale" },
          { color: "#95a5a6", label: "Basse" },
          { color: "#639922", label: "Terminée" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#666",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "8px",
                borderRadius: "4px",
                background: item.color,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageVueGantt;
