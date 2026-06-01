// =====================================================
// PageVueListe.jsx — Vue Liste des tâches
// Affiche toutes les tâches dans un tableau avec :
// tri par colonne, filtres, et actions rapides
// =====================================================
import { useState } from "react";

function PageVueListe({ tasks, projects, onToggle, onDelete, onEdit }) {
  // =====================
  // ÉTATS
  // =====================

  // Colonne de tri active — name, priority, dueDate, project
  const [sortBy, setSortBy] = useState("name");

  // Sens du tri — asc ou desc
  const [sortDir, setSortDir] = useState("asc");

  // Filtre par statut
  const [filterStatus, setFilterStatus] = useState("toutes");

  // Filtre par priorité
  const [filterPriority, setFilterPriority] = useState("toutes");

  // Filtre par projet
  const [filterProject, setFilterProject] = useState("tous");

  // Texte de recherche
  const [search, setSearch] = useState("");

  // =====================
  // FONCTIONS
  // =====================

  // Trouve le nom du projet par son id
  function getProjectName(projectId) {
    if (!Array.isArray(projects)) return "Inconnu";
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Inconnu";
  }
  // Gère le clic sur une colonne de tri
  function handleSort(col) {
    if (sortBy === col) {
      // Si même colonne — on inverse le sens
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      // Nouvelle colonne — tri ascendant par défaut
      setSortBy(col);
      setSortDir("asc");
    }
  }

  // Formate la date d'échéance
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  // Couleur selon l'urgence de la date
  function getDueDateColor(task) {
    if (!task.dueDate || task.done) return "#aaa";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return "#e74c3c";
    if (daysLeft <= 3) return "#e67e22";
    return "#aaa";
  }

  // Style du badge priorité
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
  // FILTRAGE ET TRI
  // =====================

  // Filtre par recherche
  const filteredAndSorted = Array.isArray(tasks)
    ? tasks
        .filter(
          (t) =>
            search === "" ||
            t.name.toLowerCase().includes(search.toLowerCase()),
        )
        .filter((t) => {
          if (filterStatus === "toutes") return true;
          if (filterStatus === "done") return t.done;
          if (filterStatus === "inProgress") return t.inProgress && !t.done;
          if (filterStatus === "todo") return !t.done && !t.inProgress;
          return true;
        })
        .filter((t) =>
          filterPriority === "toutes" ? true : t.priority === filterPriority,
        )
        .filter((t) =>
          filterProject === "tous"
            ? true
            : t.projectId === parseInt(filterProject),
        )
        .sort((a, b) => {
          let valA, valB;
          if (sortBy === "name") {
            valA = a.name;
            valB = b.name;
          }
          if (sortBy === "priority") {
            const order = { critique: 0, haute: 1, normale: 2, basse: 3 };
            valA = order[a.priority] ?? 4;
            valB = order[b.priority] ?? 4;
          }
          if (sortBy === "dueDate") {
            valA = a.dueDate ? new Date(a.dueDate) : new Date("9999");
            valB = b.dueDate ? new Date(b.dueDate) : new Date("9999");
          }
          if (sortBy === "project") {
            valA = getProjectName(a.projectId);
            valB = getProjectName(b.projectId);
          }
          if (valA < valB) return sortDir === "asc" ? -1 : 1;
          if (valA > valB) return sortDir === "asc" ? 1 : -1;
          return 0;
        })
    : [];

  // Icône de tri
  function sortIcon(col) {
    if (sortBy !== col) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  // Style des en-têtes de colonnes
  const thStyle = {
    padding: "10px 12px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#666",
    textAlign: "left",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    borderBottom: "2px solid #f0f0f0",
  };

  // Style des cellules
  const tdStyle = {
    padding: "10px 12px",
    fontSize: "13px",
    color: "#333",
    borderBottom: "1px solid #f5f5f5",
    verticalAlign: "middle",
  };

  // =====================
  // RENDU
  // =====================

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "1.25rem",
      }}
    >
      {/* ---- BARRE DE FILTRES ---- */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Rechercher une tâche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "200px",
            fontSize: "13px",
            padding: "6px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            outline: "none",
          }}
        />

        {/* Filtre statut */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            fontSize: "12px",
            padding: "6px 8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            color: "#666",
          }}
        >
          <option value="toutes">Tous statuts</option>
          <option value="todo">À faire</option>
          <option value="inProgress">En cours</option>
          <option value="done">Terminées</option>
        </select>

        {/* Filtre priorité */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            fontSize: "12px",
            padding: "6px 8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            color: "#666",
          }}
        >
          <option value="toutes">Toutes priorités</option>
          <option value="critique">🔴 Critique</option>
          <option value="haute">🟠 Haute</option>
          <option value="normale">🟡 Normale</option>
          <option value="basse">🟢 Basse</option>
        </select>

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
        <div style={{ fontSize: "12px", color: "#aaa", marginLeft: "auto" }}>
          {filteredAndSorted.length} tâche
          {filteredAndSorted.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ---- TABLEAU ---- */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {/* En-têtes */}
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={{ ...thStyle, width: "40px" }}></th>
              <th style={thStyle} onClick={() => handleSort("name")}>
                Tâche {sortIcon("name")}
              </th>
              <th style={thStyle} onClick={() => handleSort("project")}>
                Projet {sortIcon("project")}
              </th>
              <th style={thStyle} onClick={() => handleSort("priority")}>
                Priorité {sortIcon("priority")}
              </th>
              <th style={thStyle} onClick={() => handleSort("dueDate")}>
                Échéance {sortIcon("dueDate")}
              </th>
              <th style={{ ...thStyle, width: "80px" }}>Sous-tâches</th>
              <th style={{ ...thStyle, width: "80px" }}>Actions</th>
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "#aaa",
                    padding: "2rem",
                  }}
                >
                  Aucune tâche trouvée
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((task) => {
                const pStyle = getPriorityStyle(task.priority);
                const subTotal = task.subTasks?.length || 0;
                const subDone =
                  task.subTasks?.filter((st) => st.done).length || 0;

                return (
                  <tr
                    key={task.id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Checkbox */}
                    <td style={tdStyle}>
                      <div
                        onClick={() => onToggle(task.id)}
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "4px",
                          border: task.done ? "none" : "1.5px solid #ccc",
                          background: task.done ? "#639922" : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
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
                    </td>

                    {/* Nom + description */}
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: "500",
                          color: task.done ? "#aaa" : "#222",
                          textDecoration: task.done ? "line-through" : "none",
                        }}
                      >
                        {task.name}
                      </div>
                      {task.description && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#aaa",
                            marginTop: "2px",
                          }}
                        >
                          {task.description}
                        </div>
                      )}
                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            marginTop: "4px",
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
                    </td>

                    {/* Projet */}
                    <td style={{ ...tdStyle, color: "#666", fontSize: "12px" }}>
                      {getProjectName(task.projectId)}
                    </td>

                    {/* Priorité */}
                    <td style={tdStyle}>
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
                    </td>

                    {/* Date échéance */}
                    <td
                      style={{
                        ...tdStyle,
                        color: getDueDateColor(task),
                        fontSize: "12px",
                      }}
                    >
                      {formatDate(task.dueDate)}
                    </td>

                    {/* Sous-tâches */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {subTotal > 0 ? (
                        <div>
                          <div style={{ fontSize: "11px", color: "#aaa" }}>
                            {subDone}/{subTotal}
                          </div>
                          <div
                            style={{
                              height: "4px",
                              background: "#f0f0f0",
                              borderRadius: "2px",
                              marginTop: "3px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.round((subDone / subTotal) * 100)}%`,
                                background: "#378ADD",
                                borderRadius: "2px",
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#ddd", fontSize: "11px" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        {/* Modifier */}
                        <span
                          onClick={() => onEdit(task)}
                          style={{
                            cursor: "pointer",
                            color: "#ddd",
                            fontSize: "14px",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#378ADD")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#ddd")
                          }
                          title="Modifier"
                        >
                          ✎
                        </span>
                        {/* Supprimer */}
                        <span
                          onClick={() => onDelete(task.id)}
                          style={{
                            cursor: "pointer",
                            color: "#ddd",
                            fontSize: "14px",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#e74c3c")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#ddd")
                          }
                          title="Supprimer"
                        >
                          ✕
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PageVueListe;
