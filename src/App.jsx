// Importation des hooks useState et useEffect de React
import { useState, useEffect } from "react";

// Importation des données initiales (projets et tâches)
import { initialProjects, initialTasks } from "./data/initialData";

// Importation des fonctions API Symfony
import {
  getProjets,
  createProjet,
  deleteProjet,
  getTaches,
  createTache,
  updateTache,
  deleteTache,
  updateProjet,
} from "./api";

// Importation de tous les composants de l'application
import PageAuth from "./components/PageAuth";
import StatCard from "./components/StatCard";
import ProjectCard from "./components/ProjectCard";
import TaskItem from "./components/TaskItem";
import AddTaskForm from "./components/AddTaskForm";
import Sidebar from "./components/Sidebar";
import PageProjets from "./components/PageProjets";
import Graphique from "./components/Graphique";
import ModalEditTask from "./components/ModalEditTask";
import PageStats from "./components/PageStats";
import PageKanban from "./components/PageKanban";
import ExportPDF from "./components/ExportPDF";
import PageVueListe from "./components/PageVueListe";
import PageVueCalendrier from "./components/PageVueCalendrier";
import PageVueGantt from "./components/PageVueGantt";
import { getUtilisateurs } from "./api";
import PageInvitations from "./components/PageInvitations";

function App() {
  // =====================
  // ÉTATS DE L'APPLICATION
  // =====================

  // Token JWT de l'utilisateur connecté
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || null);

  // Email de l'utilisateur connecté
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("user_email") || "",
  );

  // Liste des tâches — initialisée vide, chargée depuis MySQL
  const [tasks, setTasks] = useState([]);

  // Liste des projets — initialisée vide, chargée depuis MySQL
  const [projects, setProjects] = useState([]);

  // État de chargement — true pendant le chargement des données
  const [loading, setLoading] = useState(true);

  // Filtre actif pour la priorité (toutes / haute / moyenne / basse)
  const [filterPriority, setFilterPriority] = useState("toutes");

  // Filtre actif pour le projet (tous / id du projet)
  const [filterProject, setFilterProject] = useState("tous");

  // Page actuellement affichée dans la sidebar
  const [activePage, setActivePage] = useState("dashboard");

  // État du mode sombre — false = clair, true = sombre
  const [darkMode, setDarkMode] = useState(false);

  // Tâche en cours de modification — null si aucune modal ouverte
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Liste des utilisateurs pour l'assignation
  const [users, setUsers] = useState([]);

  // =====================
  // CHARGEMENT DEPUIS MYSQL VIA API SYMFONY
  // =====================

  useEffect(() => {
    async function loadData() {
      try {
        // ---- ÉTAPE 1 : Chargement des projets depuis MySQL via Symfony ----
        const projectsData = await getProjets();

        // Si MySQL est vide on insère les données initiales
        if (projectsData.length === 0) {
          // MySQL vide — on insère les données initiales
          for (const project of initialProjects) {
            await createProjet({
              name: project.name,
              status: project.status,
              color: project.color,
              progress: project.progress || 0,
            });
          }
          // On recharge les projets depuis MySQL après insertion
          const newProjects = await getProjets();
          setProjects(newProjects);
          console.log("✅ Projets initiaux insérés dans MySQL !");
        } else {
          // MySQL a des données — on les utilise directement
          setProjects(projectsData);
          console.log("✅ Projets chargés depuis MySQL !");
        }

        // ---- ÉTAPE 2 : Chargement des tâches depuis MySQL via Symfony ----
        const tasksData = await getTaches();

        // ---- ÉTAPE 3 : Chargement des utilisateurs ----
        const usersData = await getUtilisateurs();
        if (usersData) setUsers(usersData);

        // Si MySQL est vide on insère les données initiales
        if (tasksData.length === 0) {
          // MySQL vide — on insère les données initiales
          for (const task of initialTasks) {
            await createTache({
              name: task.name,
              priority: task.priority,
              done: task.done || false,
              inProgress: task.inProgress || false,
              dueDate: task.dueDate || "",
              projectId: task.projectId || 1,
            });
          }
          // On recharge les tâches depuis MySQL après insertion
          const newTasks = await getTaches();
          setTasks(newTasks);
          console.log("✅ Tâches initiales insérées dans MySQL !");
        } else {
          // MySQL a des données — on les utilise directement
          setTasks(tasksData);
          console.log("✅ Tâches chargées depuis MySQL !");
        }
      } catch (error) {
        // Si l'API Symfony n'est pas disponible
        console.error("❌ Erreur chargement MySQL :", error);
      } finally {
        // Dans tous les cas on arrête l'écran de chargement
        setLoading(false);
      }
    }

    // On lance le chargement au démarrage de l'application
    loadData();
  }, []);

  // =====================
  // FILTRAGE DES TÂCHES
  // =====================

  // On applique les deux filtres en chaîne sur la liste des tâches
  const filteredTasks = Array.isArray(tasks)
    ? tasks
        // Filtre par priorité — si "toutes" on garde tout, sinon on filtre
        .filter((t) =>
          filterPriority === "toutes" ? true : t.priority === filterPriority,
        )
        // Filtre par projet — si "tous" on garde tout, sinon on compare les ids
        .filter((t) =>
          filterProject === "tous"
            ? true
            : t.projectId === parseInt(filterProject),
        )
    : [];

  // =====================
  // CALCUL DES STATISTIQUES
  // =====================

  // Nombre total de tâches
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;

  // Nombre de tâches cochées comme terminées
  const doneTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.done).length
    : 0;

  // Nombre de tâches non terminées avec priorité haute
  const highPriority = Array.isArray(tasks)
    ? tasks.filter((t) => t.priority === "haute" && !t.done).length
    : 0;

  // Nombre de projets avec le statut "En cours"
  const activeProjects = Array.isArray(projects)
    ? projects.filter((p) => p.status === "En cours").length
    : 0;

  // =====================
  // FONCTIONS
  // =====================

  // Fonction pour cocher / décocher une tâche
  async function handleToggle(id) {
    const task = tasks.find((t) => t.id === id);
    const updated = { ...task, done: !task.done };
    // On met à jour l'affichage immédiatement
    setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    // On sauvegarde dans MySQL via Symfony
    await updateTache(id, updated);
  }

  // Fonction pour ajouter une nouvelle tâche
  // Après création on recharge toutes les tâches depuis MySQL
  async function handleAdd({ name, priority, dueDate, description }) {
    const newTask = {
      name,
      projectId: filterProject !== "tous" ? parseInt(filterProject) : 1,
      priority,
      done: false,
      inProgress: false,
      dueDate: dueDate || null,
      description: description || null,
      tags: [],
      subTasks: [],
    };
    // On sauvegarde dans MySQL via Symfony
    const saved = await createTache(newTask);
    // On recharge toutes les tâches pour avoir les données fraîches
    const freshTasks = await getTaches();
    if (freshTasks) setTasks(freshTasks);
  }

  // Fonction pour retrouver le nom d'un projet
  function getProjectName(projectId) {
    const project = Array.isArray(projects)
      ? projects.find((p) => p.id === projectId)
      : null;
    return project ? project.name : "Inconnu";
  }

  // Fonction pour ajouter un projet
  async function handleAddProject(project) {
    // On sauvegarde dans MySQL via Symfony
    const saved = await createProjet({
      name: project.name,
      status: project.status,
      color: project.color,
      progress: project.progress || 0,
    });
    // On ajoute le projet retourné par MySQL avec son vrai id
    setProjects([...projects, saved]);
  }

  // Fonction pour supprimer une tâche
  async function handleDelete(id) {
    // On supprime de l'affichage immédiatement
    setTasks(tasks.filter((t) => t.id !== id));
    // On supprime dans MySQL via Symfony
    await deleteTache(id);
  }

  // Fonction pour modifier une tâche
  // Après sauvegarde on recharge toutes les tâches depuis MySQL
  // pour avoir les sous-tâches et tags à jour
  async function handleEdit(updatedTask) {
    // On met à jour l'affichage immédiatement
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    // On sauvegarde dans MySQL via Symfony
    await updateTache(updatedTask.id, updatedTask);
    // On recharge toutes les tâches pour avoir les sous-tâches fraîches
    const freshTasks = await getTaches();
    if (freshTasks) setTasks(freshTasks);
  }

  // Fonction pour supprimer un projet
  async function handleDeleteProject(id) {
    // On supprime de l'affichage immédiatement
    setProjects(projects.filter((p) => p.id !== id));
    // On supprime dans MySQL via Symfony
    await deleteProjet(id);
  }

  // Fonction pour déplacer une tâche dans le Kanban
  async function handleTaskMove(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId);
    const updated = { ...task, ...newStatus };
    // On met à jour l'affichage immédiatement
    setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    // On sauvegarde dans MySQL via Symfony
    await updateTache(taskId, updated);
  }

  // Fonction appelée quand l'utilisateur se connecte
  function handleLogin(newToken, email) {
    setToken(newToken);
    setUserEmail(email);
  }

  // Fonction de déconnexion
  function handleLogout() {
    // On supprime le token du localStorage
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_email");
    setToken(null);
    setUserEmail("");
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
  };

  // =====================
  // RENDU DE L'APPLICATION
  // =====================

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: darkMode ? "#1a1a1a" : "#f5f5f5",
        fontFamily: "sans-serif",
        transition: "background 0.3s",
      }}
    >
      {/* ---- PAGE AUTH — affichée si pas connecté ---- */}
      {!token && <PageAuth onLogin={handleLogin} />}

      {/* ---- APPLICATION — affichée si connecté ---- */}
      {token && (
        <>
          {/* Écran de chargement pendant la connexion à MySQL */}
          {loading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                color: "#888",
                zIndex: 9999,
              }}
            >
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
            userEmail={userEmail}
            onLogout={handleLogout}
          />

          {/* ---- CONTENU PRINCIPAL ---- */}
          <div
            style={{
              flex: 1,
              padding: "2rem",
              overflowY: "auto",
              overflowX: "hidden",
              minWidth: 0,
              color: darkMode ? "#eee" : "#222",
              transition: "color 0.3s",
            }}
          >
            {/* Titre de la page */}
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "500",
                marginBottom: "1.5rem",
                textTransform: "capitalize",
              }}
            >
              {activePage}
            </h1>

            {/* ---- PAGE DASHBOARD ---- */}
            {activePage === "dashboard" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <StatCard
                    label="Projets actifs"
                    value={activeProjects}
                    sub={`sur ${projects.length} projets`}
                  />
                  <StatCard
                    label="Tâches totales"
                    value={totalTasks}
                    sub={`${doneTasks} terminées`}
                  />
                  <StatCard
                    label="Complétion"
                    value={`${totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%`}
                    sub="taux global"
                  />
                  <StatCard
                    label="Urgentes"
                    value={highPriority}
                    sub="priorité haute"
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <Graphique projects={projects} />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: "12px",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "1rem",
                      }}
                    >
                      Projets
                    </div>
                    {Array.isArray(projects) &&
                      projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                  </div>

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: "12px",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: "500" }}>
                        Tâches
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <select
                          style={selectStyle}
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                        >
                          <option value="toutes">Toutes</option>
                          <option value="haute">Haute</option>
                          <option value="moyenne">Moyenne</option>
                          <option value="basse">Basse</option>
                        </select>
                        <select
                          style={selectStyle}
                          value={filterProject}
                          onChange={(e) => setFilterProject(e.target.value)}
                        >
                          <option value="tous">Tous projets</option>
                          {Array.isArray(projects) &&
                            projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#aaa",
                          textAlign: "center",
                          padding: "1rem 0",
                        }}
                      >
                        Aucune tâche trouvée
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          projectName={getProjectName(task.projectId)}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          onEdit={setTaskToEdit}
                          users={users}
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
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    Toutes les tâches
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <select
                      style={selectStyle}
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="toutes">Toutes</option>
                      <option value="haute">Haute</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="basse">Basse</option>
                    </select>
                    <select
                      style={selectStyle}
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                    >
                      <option value="tous">Tous projets</option>
                      {Array.isArray(projects) &&
                        projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#aaa",
                      textAlign: "center",
                      padding: "1rem 0",
                    }}
                  >
                    Aucune tâche trouvée
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      projectName={getProjectName(task.projectId)}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={setTaskToEdit}
                      users={users}
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

            {/* ---- PAGE INVITATIONS ---- */}
            {activePage === "invitations" && (
              <PageInvitations projects={projects} />
            )}

            {/* ---- PAGE VUE LISTE ---- */}
            {activePage === "liste" && (
              <PageVueListe
                tasks={tasks}
                projects={projects}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={setTaskToEdit}
                loading={loading}
              />
            )}
            {/* ---- PAGE VUE CALENDRIER ---- */}
            {activePage === "calendrier" && (
              <PageVueCalendrier
                tasks={tasks}
                projects={projects}
                onEdit={setTaskToEdit}
              />
            )}

            {/* ---- PAGE VUE GANTT ---- */}
            {activePage === "gantt" && (
              <PageVueGantt tasks={tasks} projects={projects} />
            )}

            {/* ---- PAGE STATISTIQUES ---- */}
            {activePage === "stats" && (
              <PageStats tasks={tasks} projects={projects} users={users} />
            )}

            {/* ---- PAGE RAPPORT PDF ---- */}
            {activePage === "rapport" && (
              <ExportPDF tasks={tasks} projects={projects} users={users} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
