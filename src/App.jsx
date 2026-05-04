// Importation de Firebase et Firestore
import { db } from "./firebase"
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore"

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
import PageKanban from "./components/PageKanban" 
import ExportPDF from "./components/ExportPDF"





function App() {

    // =====================
    // ÉTATS DE L'APPLICATION
    // =====================

    // Liste des tâches — initialisée vide, chargée depuis Firebase
    const [tasks, setTasks] = useState([])

    // Liste des projets — initialisée vide, chargée depuis Firebase
    const [projects, setProjects] = useState([])

    // État de chargement — true pendant le chargement des données
    const [loading, setLoading] = useState(true)

    // Filtre actif pour la priorité (toutes / haute / moyenne / basse)
    const [filterPriority, setFilterPriority] = useState("toutes")

    // Filtre actif pour le projet (tous / id du projet)
    const [filterProject, setFilterProject] = useState("tous")

    // Page actuellement affichée dans la sidebar
    const [activePage, setActivePage] = useState("dashboard")

    // État du mode sombre — false = clair, true = sombre
    const [darkMode, setDarkMode] = useState(false)

    // Tâche en cours de modification — null si aucune modal ouverte
    const [taskToEdit, setTaskToEdit] = useState(null)

  // =====================
  // SAUVEGARDE AUTOMATIQUE
  // =====================

  // =====================
  // CHARGEMENT DEPUIS FIREBASE
  // =====================

  // On charge les données depuis Firebase au démarrage
  useEffect(() => {
    async function loadData() {
      try {
        // Chargement des tâches
        const tasksSnap = await getDocs(collection(db, "tasks"))
        const tasksData = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Chargement des projets
        const projectsSnap = await getDocs(collection(db, "projects"))
        const projectsData = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Si Firebase est vide on charge les données initiales
        if (tasksData.length === 0) {
          for (const task of initialTasks) {
            await setDoc(doc(db, "tasks", String(task.id)), task)
          }
          setTasks(initialTasks)
        } else {
          setTasks(tasksData)
        }

        if (projectsData.length === 0) {
          for (const project of initialProjects) {
            await setDoc(doc(db, "projects", String(project.id)), project)
          }
          setProjects(initialProjects)
        } else {
          setProjects(projectsData)
        }

      } catch (error) {
        console.error("Erreur Firebase :", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Sauvegarde une tâche dans Firebase
  async function saveTask(task) {
    await setDoc(doc(db, "tasks", String(task.id)), task)
  }

  // Supprime une tâche dans Firebase
  async function deleteTask(id) {
    await deleteDoc(doc(db, "tasks", String(id)))
  }

  // Sauvegarde un projet dans Firebase
  async function saveProject(project) {
    await setDoc(doc(db, "projects", String(project.id)), project)
  }

  // Supprime un projet dans Firebase
  async function deleteProject(id) {
    await deleteDoc(doc(db, "projects", String(id)))
  }

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
  async function handleToggle(id) {
    const task = tasks.find(t => t.id === id)
    const updated = { ...task, done: !task.done }
    setTasks(tasks.map(t => t.id === id ? updated : t))
    await saveTask(updated)
  }

  // Fonction pour ajouter une nouvelle tâche
  async function handleAdd({ name, priority }) {
    const newTask = {
      id: Date.now(),
      name,
      projectId: filterProject !== "tous" ? parseInt(filterProject) : 1,
      priority,
      done: false,
      inProgress: false,
      dueDate: "",
    }
    setTasks([...tasks, newTask])
    await saveTask(newTask)
  }

  // Fonction pour retrouver le nom d'un projet
  function getProjectName(projectId) {
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : "Inconnu"
  }

  // Fonction pour ajouter un projet
  async function handleAddProject(project) {
    setProjects([...projects, project])
    await saveProject(project)
  }

  // Fonction pour supprimer une tâche
  async function handleDelete(id) {
    setTasks(tasks.filter(t => t.id !== id))
    await deleteTask(id)
  }

  // Fonction pour modifier une tâche
  async function handleEdit(updatedTask) {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    await saveTask(updatedTask)
  }

  // Fonction pour supprimer un projet
  async function handleDeleteProject(id) {
    setProjects(projects.filter(p => p.id !== id))
    await deleteProject(id)
  }

  // Fonction pour déplacer une tâche dans le Kanban
  async function handleTaskMove(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId)
    const updated = { ...task, ...newStatus }
    setTasks(tasks.map(t => t.id === taskId ? updated : t))
    await saveTask(updated)
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

    {/* Écran de chargement pendant la connexion à Firebase */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          color: "#888",
          zIndex: 9999,
        }}>
          Chargement des données...
        </div>
      )}

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

        {/* ---- PAGE KANBAN ---- */}
        {activePage === "kanban" && (
          <PageKanban
            tasks={tasks}
            projects={projects}
            onTaskMove={handleTaskMove}
          />
        )}

        
        {/* ---- PAGE STATISTIQUES ---- */}
        {activePage === "stats" && (
          <PageStats tasks={tasks} projects={projects} />
        )}

        {/* ---- PAGE RAPPORT PDF ---- */}
        {activePage === "rapport" && (
          <ExportPDF tasks={tasks} projects={projects} />
        )}

      </div>
    </div>
  )
}

export default App