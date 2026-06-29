// =====================================================
// PageVueCalendrier.jsx — Vue Calendrier des tâches
// Affiche les tâches sur un calendrier mensuel
// selon leur date d'échéance
// =====================================================
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function PageVueCalendrier({ tasks, projects, onEdit }) {
  // =====================
  // ÉTATS
  // =====================

  // Date sélectionnée sur le calendrier
  const [selectedDate, setSelectedDate] = useState(new Date());

  // =====================
  // FONCTIONS
  // =====================

  // Trouve le nom du projet par son id
  function getProjectName(projectId) {
    if (!Array.isArray(projects)) return "Inconnu";
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Inconnu";
  }

  // Formate une date en string "YYYY-MM-DD" pour comparer
  function formatDateKey(date) {
    return date.toISOString().split("T")[0];
  }

  // Récupère les tâches pour une date donnée
  function getTasksForDate(date) {
    const dateKey = formatDateKey(date);
    return Array.isArray(tasks)
      ? tasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateKey))
      : [];
  }

  // Tâches de la date sélectionnée
  const selectedTasks = getTasksForDate(selectedDate);

  // Couleur du badge priorité
  function getPriorityStyle(priority) {
    switch (priority) {
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

  // =====================
  // RENDU DES POINTS SUR LE CALENDRIER
  // Affiche des points colorés sous les dates qui ont des tâches
  // =====================
  function tileContent({ date, view }) {
    if (view !== "month") return null;
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2px",
          marginTop: "2px",
        }}
      >
        {dayTasks.slice(0, 3).map((task, i) => (
          <div
            key={i}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: task.done
                ? "#639922"
                : task.priority === "critique"
                  ? "#e74c3c"
                  : task.priority === "haute"
                    ? "#e67e22"
                    : "#378ADD",
            }}
          />
        ))}
      </div>
    );
  }

  // Classe CSS pour colorer les tuiles du calendrier
  function tileClassName({ date, view }) {
    if (view !== "month") return null;
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    // Vérifie si une tâche est en retard
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasOverdue = dayTasks.some((t) => !t.done && new Date(t.dueDate) < today);
    if (hasOverdue) return "has-overdue-tasks";
    return "has-tasks";
  }

  // =====================
  // RENDU
  // =====================

  return (
    <div
      className="calendrier-container"
      style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
    >
      {/* ---- CALENDRIER ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
          flex: "1",
        }}
      >
        {/* <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
          width: "100%",
        }}
      > */}
        <style>{`
          .react-calendar {
            border: none !important;
            font-family: sans-serif !important;
            width: 100% !important;
          }

          @media (max-width: 1024px) {
            .react-calendar {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
          .react-calendar__tile {
            height: 80px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding-top: 8px !important;
            font-size: 13px !important;
          }

          @media (max-width: 768px) {
            .react-calendar__tile {
              height: 45px !important;
              font-size: 11px !important;
            }
          }
          .react-calendar__tile--active {
            background: #111 !important;
            color: white !important;
            border-radius: 8px !important;
          }
          .react-calendar__tile--now {
            background: #f0f0f0 !important;
            border-radius: 8px !important;
          }
          .react-calendar__tile:hover {
            background: #f5f5f5 !important;
            border-radius: 8px !important;
          }
          .has-tasks {
            background: #EBF5FB !important;
            border-radius: 8px !important;
          }
          .has-overdue-tasks {
            background: #FDEDEC !important;
            border-radius: 8px !important;
          }
          .react-calendar__navigation button {
            font-size: 14px !important;
            font-weight: 500 !important;
          }
          .react-calendar__month-view__weekdays {
            font-size: 11px !important;
            color: #aaa !important;
          }

          @media (max-width: 768px) {
            .calendrier-container {
              flex-direction: column !important;
            }
            .react-calendar {
              width: 100% !important;
              max-width: 100% !important;
            }
            .react-calendar__tile {
              height: 45px !important;
              font-size: 11px !important;
            }
          }
        `}</style>

        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          locale="fr-FR"
        />

        {/* Légende */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "12px",
            padding: "8px",
            background: "#f9f9f9",
            borderRadius: "8px",
            flexWrap: "wrap",
          }}
        >
          {[
            { color: "#e74c3c", label: "Critique" },
            { color: "#e67e22", label: "Haute" },
            { color: "#378ADD", label: "Normale/Basse" },
            { color: "#639922", label: "Terminée" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                color: "#666",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: item.color,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ---- LISTE DES TÂCHES DU JOUR ---- */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
          minHeight: "400px",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "1rem",
            color: "#222",
          }}
        >
          📅{" "}
          {selectedDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        {selectedTasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#aaa",
              fontSize: "13px",
              padding: "2rem 0",
            }}
          >
            Aucune tâche pour cette date
          </div>
        ) : (
          selectedTasks.map((task) => {
            const pStyle = getPriorityStyle(task.priority);
            const subTotal = task.subTasks?.length || 0;
            const subDone = task.subTasks?.filter((st) => st.done).length || 0;

            return (
              <div
                key={task.id}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #f0f0f0",
                  marginBottom: "8px",
                  background: task.done ? "#fafafa" : "#fff",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                onClick={() => onEdit(task)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: task.done ? "#aaa" : "#222",
                      textDecoration: task.done ? "line-through" : "none",
                    }}
                  >
                    {task.done ? "✅" : "⏳"} {task.name}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      background: pStyle.bg,
                      color: pStyle.color,
                    }}
                  >
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "4px",
                    }}
                  >
                    {task.description}
                  </div>
                )}

                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                  📁 {getProjectName(task.projectId)}
                </div>

                {subTotal > 0 && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "4px",
                    }}
                  >
                    ✅ {subDone}/{subTotal} sous-tâches
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      marginTop: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {task.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
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
            );
          })
        )}
      </div>
    </div>
  );
}

export default PageVueCalendrier;
