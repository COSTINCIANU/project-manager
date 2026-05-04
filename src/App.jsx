// Importation des hooks useState et useEffect de React
import { useState, useEffect } from "react"

// Importation des données initiales (projets et tâches)
import { initialProjects, initialTasks } from "./data/initialData"

// Importation de tous les composants de l'application
import StatCard from "./components/StatCard"
import ProjectCard from "./components/ProjectCard"
import TaskItem from "./components/TaskItem"
import AddTaskForm from "./components/AddTaskForm"
import Sidebar from "./components/Sidebar"
import PageProjets from "./components/PageProjets"
import Graphique from "./components/Graphique"
import ModalEditTask from "./components/ModalEditTask"
import PageStats from "./components/PageStats"





function App() {

   // =====================
  // ÉTATS DE L'APPLICATION
  // =====================

  // On récupère les tâches depuis localStorage si elles existent
  // Sinon on utilise les données initiales
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks")
    return saved ? JSON.parse(saved) : initialTasks
  })

  // Filtre actif pour la priorité (toutes / haute / moyenne / basse)
  const [filterPriority, setFilterPriority] = useState("toutes")

  // Filtre actif pour le projet (tous / id du projet)
  const [filterProject, setFilterProject] = useState("tous")

  // Page actuellement affichée dans la sidebar
  const [activePage, setActivePage] = useState("dashboard")

  // Liste des projets — récupérée depuis localStorage si elle existe
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("projects")
    return saved ? JSON.parse(saved) : initialProjects
  })

  // État du mode sombre — false = clair, true = sombre
  const [darkMode, setDarkMode] = useState(false)

  // Tâche en cours de modification — null si aucune modal ouverte
  const [taskToEdit, setTaskToEdit] = useState(null)


  // =====================
  // SAUVEGARDE AUTOMATIQUE
  // =====================

  // Chaque fois que la liste des tâches change, on la sauvegarde dans localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])
 
  // Sauvegarde automatique des projets dans localStorage
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])


  // =====================
  // FILTRAGE DES TÂCHES
  // =====================

  // On applique les deux filtres en chaîne sur la liste des tâches
  const filteredTasks = tasks
    // Filtre par priorité — si "toutes" on garde tout, sinon on filtre
    .filter(t => filterPriority === "toutes" ? true : t.priority === filterPriority)
    // Filtre par projet — si "tous" on garde tout, sinon on compare les ids
    .filter(t => filterProject === "tous" ? true : t.projectId === parseInt(filterProject))

  // =====================
  // CALCUL DES STATISTIQUES
  // =====================

  // Nombre total de tâches
  const totalTasks = tasks.length

  // Nombre de tâches cochées comme terminées
  const doneTasks = tasks.filter(t => t.done).length

  // Nombre de tâches non terminées avec priorité haute
  const highPriority = tasks.filter(t => t.priority === "haute" && !t.done).length

  // Nombre de projets avec le statut "En cours"
  const activeProjects = initialProjects.filter(p => p.status === "En cours").length

  // =====================
  // FONCTIONS
  // =====================

  // Fonction pour cocher / décocher une tâche
  function handleToggle(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  // Fonction pour ajouter une nouvelle tâche
  function handleAdd({ name, priority }) {
    const newTask = {
      id: Date.now(),
      name,
      projectId: filterProject !== "tous" ? parseInt(filterProject) : 1,
      priority,
      done: false,
    }
    setTasks([...tasks, newTask])
  }

  // Fonction pour retrouver le nom d'un projet à partir de son id
  function getProjectName(projectId) {
    const project = initialProjects.find(p => p.id === projectId)
    return project ? project.name : "Inconnu"
  }


  // Fonction pour ajouter un nouveau projet
  function handleAddProject(project) {
    setProjects([...projects, project])
  }

  // Fonction pour supprimer une tâche par son id
  function handleDelete(id) {
    setTasks(tasks.filter(t => t.id !== id))
  }

  // Fonction pour modifier une tâche existante
  function handleEdit(updatedTask) {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  // Fonction pour supprimer un projet par son id
  function handleDeleteProject(id) {
    setProjects(projects.filter(p => p.id !== id))
  }


  // =====================
  // STYLE RÉUTILISABLE
  // =====================

  // Style commun pour les menus déroulants (select)
  const selectStyle = {
    fontSize: "12px",
    padding: "4px 8px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    color: "#666",
    background: "#fff",
    cursor: "pointer",
  }

  // =====================
  // RENDU DE L'APPLICATION
  // =====================

 return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: darkMode ? "#1a1a1a" : "#f5f5f5",
      fontFamily: "sans-serif",
      transition: "background 0.3s",
    }}>

      {/* ---- MODAL MODIFICATION TÂCHE ---- */}
      {taskToEdit && (
        <ModalEditTask
          task={taskToEdit}
          projects={projects}
          onSave={handleEdit}
          onClose={() => setTaskToEdit(null)}
        />
      )}

      {/* ---- SIDEBAR ---- */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
      />

      {/* ---- CONTENU PRINCIPAL ---- */}
      <div style={{
        flex: 1,
        padding: "2rem",
        overflowY: "auto",
        overflowX: "hidden",
        minWidth: 0,
        color: darkMode ? "#eee" : "#222",
        transition: "color 0.3s",
      }}>

        {/* Titre de la page */}
        <h1 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "1.5rem", textTransform: "capitalize" }}>
          {activePage}
        </h1>

        {/* ---- PAGE DASHBOARD ---- */}
        {activePage === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "14px" }}>
              <StatCard label="Projets actifs" value={activeProjects} sub={`sur ${projects.length} projets`} />
              <StatCard label="Tâches totales" value={totalTasks} sub={`${doneTasks} terminées`} />
              <StatCard label="Complétion" value={`${totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0}%`} sub="taux global" />
              <StatCard label="Urgentes" value={highPriority} sub="priorité haute" />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <Graphique projects={projects} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}>Projets</div>
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>Tâches</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <select style={selectStyle} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                      <option value="toutes">Toutes</option>
                      <option value="haute">Haute</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="basse">Basse</option>
                    </select>
                    <select style={selectStyle} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                      <option value="tous">Tous projets</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "1rem 0" }}>
                    Aucune tâche trouvée
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      projectName={getProjectName(task.projectId)}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={setTaskToEdit}
                    />
                  ))
                )}
                <AddTaskForm onAdd={handleAdd} />
              </div>
            </div>
          </>
        )}

        {/* ---- PAGE PROJETS ---- */}
        {activePage === "projets" && (
          <PageProjets
            projects={projects}
            onAdd={handleAddProject}
            onDelete={handleDeleteProject}
          />
        )}

        {/* ---- PAGE TÂCHES ---- */}
        {activePage === "taches" && (
          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>Toutes les tâches</div>
              <div style={{ display: "flex", gap: "6px" }}>
                <select style={selectStyle} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                  <option value="toutes">Toutes</option>
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="basse">Basse</option>
                </select>
                <select style={selectStyle} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                  <option value="tous">Tous projets</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "1rem 0" }}>
                Aucune tâche trouvée
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projectName={getProjectName(task.projectId)}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={setTaskToEdit}
                />
              ))
            )}
            <AddTaskForm onAdd={handleAdd} />
          </div>
        )}

        {/* ---- PAGE STATISTIQUES ---- */}
        {activePage === "stats" && (
          <PageStats tasks={tasks} projects={projects} />
        )}

      </div>
    </div>
  )
}

export default App