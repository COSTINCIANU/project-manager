// =====================================================
// PageVueTimeline.jsx — Vue Timeline des tâches
// Affiche les tâches sur un axe temporel horizontal
// avec barres colorées selon la priorité
// Affiche aussi les jalons (drapeaux 🏁) du projet
// Responsive : scroll horizontal sur mobile
// =====================================================
import { useState, useMemo, useEffect } from "react";

function PageVueTimeline({ tasks, projects }) {
  // =====================
  // ÉTATS
  // =====================
  // Filtre par projet
  const [filterProject, setFilterProject] = useState("tous");
  // Nombre de jours affichés
  const [daysRange, setDaysRange] = useState(30);
  // Jalons chargés depuis l'API
  const [jalons, setJalons] = useState([]);

  // =====================
  // CHARGEMENT DES JALONS
  // Charge les jalons de tous les projets affichés
  // =====================
  useEffect(() => {
    async function chargerJalons() {
      const safeProjects = Array.isArray(projects) ? projects : [];
      const projetsAffiches =
        filterProject === "tous"
          ? safeProjects
          : safeProjects.filter((p) => p.id === parseInt(filterProject));

      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
      const tousLesJalons = [];

      for (const projet of projetsAffiches) {
        try {
          const reponse = await fetch(`${API_URL}/projets/${projet.id}/jalons`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
          });
          const données = await reponse.json();
          if (Array.isArray(données)) {
            tousLesJalons.push(...données.map((j) => ({ ...j, projectId: projet.id })));
          }
        } catch (err) {
          console.error("Erreur chargement jalons :", err);
        }
      }

      setJalons(tousLesJalons);
    }

    chargerJalons();
  }, [projects, filterProject]);

  // =====================
  // DONNÉES
  // =====================
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Date de début — aujourd'hui moins 7 jours
  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Date de fin — startDate + daysRange
  const endDate = useMemo(() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + daysRange);
    return d;
  }, [startDate, daysRange]);

  // Durée totale en jours
  const totalDays = daysRange;

  // Génération des jours pour l'en-tête
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [startDate, totalDays]);

  // Tâches filtrées avec dates
  const filteredTasks = useMemo(() => {
    return safeTasks.filter((t) => {
      if (!t.dueDate) return false;
      if (filterProject !== "tous" && t.projectId !== parseInt(filterProject)) return false;
      return true;
    });
  }, [safeTasks, filterProject]);

  // =====================
  // CALCUL POSITION D'UNE TÂCHE
  // Retourne left% et width% sur la timeline
  // =====================
  function getTaskPosition(task) {
    const due = new Date(task.dueDate);
    // Date de début de la tâche = 3 jours avant l'échéance par défaut
    const taskStart = new Date(due);
    taskStart.setDate(taskStart.getDate() - 3);

    // Clamp entre startDate et endDate
    const clampedStart = Math.max(taskStart.getTime(), startDate.getTime());
    const clampedEnd = Math.min(due.getTime(), endDate.getTime());

    if (clampedStart > endDate.getTime() || clampedEnd < startDate.getTime()) {
      return null; // Hors de la fenêtre
    }

    const totalMs = endDate.getTime() - startDate.getTime();
    const left = ((clampedStart - startDate.getTime()) / totalMs) * 100;
    const width = ((clampedEnd - clampedStart) / totalMs) * 100;

    return {
      left: Math.max(0, left),
      width: Math.max(0.5, width),
    };
  }

  // =====================
  // POSITION D'UN JALON SUR L'AXE (en %)
  // Retourne null si le jalon est hors de la fenêtre affichée
  // =====================
  function getJalonPosition(jalon) {
    const dateJalon = new Date(jalon.date);
    const totalMs = endDate.getTime() - startDate.getTime();
    const leftPct = ((dateJalon.getTime() - startDate.getTime()) / totalMs) * 100;
    if (leftPct < 0 || leftPct > 100) return null;
    return leftPct;
  }

  // =====================
  // COULEUR PAR PRIORITÉ
  // =====================
  function getPriorityColor(priority) {
    switch (priority) {
      case "critique":
        return "#e74c3c";
      case "haute":
        return "#e67e22";
      case "normale":
        return "#378ADD";
      case "basse":
        return "#639922";
      default:
        return "#aaa";
    }
  }

  // =====================
  // NOM DU PROJET
  // =====================
  function getProjectName(projectId) {
    const p = safeProjects.find((p) => p.id === projectId);
    return p ? p.name : "—";
  }

  // =====================
  // FORMATAGE DATE
  // =====================
  function formatDay(date) {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  // Est-ce que c'est aujourd'hui ?
  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ maxWidth: "100%", overflow: "hidden" }}>
      {/* ---- EN-TÊTE FILTRES ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1rem 1.5rem",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "500" }}>📅 Vue Timeline</span>

        {/* Filtre projet */}
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={{
            fontSize: "13px",
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            background: "#fff",
          }}
        >
          <option value="tous">Tous les projets</option>
          {safeProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Plage de jours */}
        <select
          value={daysRange}
          onChange={(e) => setDaysRange(parseInt(e.target.value))}
          style={{
            fontSize: "13px",
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            background: "#fff",
          }}
        >
          <option value={14}>2 semaines</option>
          <option value={30}>1 mois</option>
          <option value={60}>2 mois</option>
          <option value={90}>3 mois</option>
        </select>

        {/* Légende priorités + jalons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginLeft: "auto",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Critique", color: "#e74c3c" },
            { label: "Haute", color: "#e67e22" },
            { label: "Normale", color: "#378ADD" },
            { label: "Basse", color: "#639922" },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: p.color,
                }}
              />
              <span style={{ color: "#666" }}>{p.label}</span>
            </div>
          ))}
          {/* Légende jalon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
            }}
          >
            <span>🏁</span>
            <span style={{ color: "#666" }}>Jalon</span>
          </div>
        </div>
      </div>

      {/* ---- TIMELINE ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Scroll horizontal sur mobile */}
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "800px" }}>
            {/* ---- EN-TÊTE DATES ---- */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #eee",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 10,
              }}
            >
              {/* Colonne tâche */}
              <div
                style={{
                  width: "200px",
                  flexShrink: 0,
                  padding: "8px 12px",
                  fontSize: "11px",
                  color: "#999",
                  fontWeight: "500",
                  borderRight: "1px solid #eee",
                }}
              >
                TÂCHE
              </div>

              {/* Colonnes dates */}
              <div style={{ flex: 1, position: "relative", height: "36px" }}>
                {days
                  .filter((_, i) => i % Math.ceil(totalDays / 10) === 0)
                  .map((day, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${(days.indexOf(day) / totalDays) * 100}%`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "10px",
                        color: isToday(day) ? "#378ADD" : "#aaa",
                        fontWeight: isToday(day) ? "600" : "400",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDay(day)}
                    </div>
                  ))}

                {/* Ligne "aujourd'hui" */}
                {(() => {
                  const today = new Date();
                  const totalMs = endDate.getTime() - startDate.getTime();
                  const leftPct = ((today.getTime() - startDate.getTime()) / totalMs) * 100;
                  if (leftPct < 0 || leftPct > 100) return null;
                  return (
                    <div
                      style={{
                        position: "absolute",
                        left: `${leftPct}%`,
                        top: 0,
                        bottom: 0,
                        width: "2px",
                        background: "#378ADD",
                        opacity: 0.5,
                      }}
                    />
                  );
                })()}

                {/* ---- MARQUEURS JALONS sur l'axe d'en-tête ---- */}
                {jalons.map((jalon) => {
                  const leftPct = getJalonPosition(jalon);
                  if (leftPct === null) return null;
                  return (
                    <div
                      key={`jalon-marker-${jalon.id}`}
                      style={{
                        position: "absolute",
                        left: `${leftPct}%`,
                        top: "2px",
                        transform: "translateX(-50%)",
                        fontSize: "12px",
                        cursor: "default",
                      }}
                      title={`🏁 ${jalon.nom} — ${jalon.date}`}
                    >
                      🏁
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---- LIGNES TÂCHES ---- */}
            {filteredTasks.length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: "13px",
                }}
              >
                Aucune tâche avec date d'échéance pour cette période
              </div>
            ) : (
              filteredTasks.map((task) => {
                const pos = getTaskPosition(task);
                if (!pos) return null;

                const color = getPriorityColor(task.priority);

                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      borderBottom: "1px solid #f5f5f5",
                      minHeight: "44px",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Nom de la tâche */}
                    <div
                      style={{
                        width: "200px",
                        flexShrink: 0,
                        padding: "8px 12px",
                        borderRight: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: task.done ? "#aaa" : "#222",
                          textDecoration: task.done ? "line-through" : "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.name}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#aaa",
                          marginTop: "2px",
                        }}
                      >
                        {getProjectName(task.projectId)}
                      </div>
                    </div>

                    {/* Barre timeline */}
                    <div style={{ flex: 1, position: "relative", height: "44px" }}>
                      {/* Fond alterné */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${pos.left}%`,
                          width: `${pos.width}%`,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "20px",
                          background: task.done ? "#f0f0f0" : color,
                          borderRadius: "4px",
                          opacity: task.done ? 0.5 : 0.85,
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "6px",
                          overflow: "hidden",
                          cursor: "default",
                          minWidth: "4px",
                        }}
                        title={`${task.name} — échéance: ${task.dueDate}`}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {task.name}
                        </span>
                      </div>

                      {/* Ligne aujourd'hui */}
                      {(() => {
                        const today = new Date();
                        const totalMs = endDate.getTime() - startDate.getTime();
                        const leftPct = ((today.getTime() - startDate.getTime()) / totalMs) * 100;
                        if (leftPct < 0 || leftPct > 100) return null;
                        return (
                          <div
                            style={{
                              position: "absolute",
                              left: `${leftPct}%`,
                              top: 0,
                              bottom: 0,
                              width: "1px",
                              background: "#378ADD",
                              opacity: 0.3,
                            }}
                          />
                        );
                      })()}

                      {/* Lignes verticales pointillées des jalons */}
                      {jalons.map((jalon) => {
                        const leftPct = getJalonPosition(jalon);
                        if (leftPct === null) return null;
                        return (
                          <div
                            key={`jalon-line-${jalon.id}-${task.id}`}
                            style={{
                              position: "absolute",
                              left: `${leftPct}%`,
                              top: 0,
                              bottom: 0,
                              width: "1px",
                              borderLeft: `1px dashed ${jalon.couleur || "#9B7FD4"}`,
                              opacity: 0.4,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageVueTimeline;
