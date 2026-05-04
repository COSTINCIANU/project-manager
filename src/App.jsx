// Importation des hooks useState et useEffect de React
import { useState, useEffect } from "react";

// Importation des données initiales (projets et tâches)
import { initialProjects, initialTasks } from "./data/initialData";

// Importation des fonctions API Symfony
import {
  getProjets,
  createProjet,
  updateProjet,
  deleteProjet,
  getTaches,
  createTache,
  updateTache,
  deleteTache,
} from "./api";

// // Importation de Firebase et Firestore
// import { db } from "./firebase";
// import {
//   collection,
//   getDocs,
//   setDoc,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";

// Importation de tous les composants de l'application
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

function App() {
  // =====================
  // ÉTATS DE L'APPLICATION
  // =====================

  // Liste des tâches — initialisée vide, chargée depuis Firebase
  const [tasks, setTasks] = useState([]);

  // Liste des projets — initialisée vide, chargée depuis Firebase
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
  // CHARGEMENT ET SYNCHRONISATION DES DONNÉES  premier avec firebase
  // =====================
  // useEffect(() => {
  //   async function loadData() {
  //     try {
  //       // ---- ÉTAPE 1 : Chargement des tâches depuis Firebase ----
  //       const tasksSnap = await getDocs(collection(db, "tasks"));
  //       // On convertit les documents Firebase en objets JavaScript
  //       const tasksData = tasksSnap.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       // ---- ÉTAPE 2 : Chargement des projets depuis Firebase ----
  //       const projectsSnap = await getDocs(collection(db, "projects"));
  //       // On convertit les documents Firebase en objets JavaScript
  //       const projectsData = projectsSnap.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       // ---- ÉTAPE 3 : Si Firebase est vide on charge les données initiales ----
  //       if (tasksData.length === 0) {
  //         // Firebase vide — on insère les données initiales dans Firebase
  //         for (const task of initialTasks) {
  //           await setDoc(doc(db, "tasks", String(task.id)), task);
  //         }
  //         setTasks(initialTasks);
  //       } else {
  //         // Firebase a des données — on les utilise directement
  //         setTasks(tasksData);
  //       }

  //       if (projectsData.length === 0) {
  //         // Firebase vide — on insère les données initiales dans Firebase
  //         for (const project of initialProjects) {
  //           await setDoc(doc(db, "projects", String(project.id)), project);
  //         }
  //         setProjects(initialProjects);
  //       } else {
  //         // Firebase a des données — on les utilise directement
  //         setProjects(projectsData);
  //       }

  //       // ---- ÉTAPE 4 : Synchronisation Firebase → MySQL via API Symfony ----
  //       try {
  //         // On vérifie si MySQL est accessible en récupérant les projets et tâches
  //         const mysqlProjects = await getProjets();
  //         const mysqlTasks = await getTaches();

  //         // ---- Synchronisation des projets ----
  //         // Si MySQL est vide et Firebase a des projets on synchronise
  //         if (mysqlProjects.length === 0 && projectsData.length > 0) {
  //           for (const project of projectsData) {
  //             await createProjet({
  //               name: project.name,
  //               status: project.status,
  //               color: project.color,
  //               progress: project.progress || 0,
  //             });
  //           }
  //           // Synchronisation des projets réussie
  //           console.log("✅ Projets synchronisés vers MySQL !");
  //         } else {
  //           // MySQL a déjà les projets — pas besoin de synchroniser
  //           console.log("ℹ️ MySQL déjà synchronisé pour les projets");
  //         }

  //         // ---- Synchronisation des tâches ----
  //         // Si MySQL est vide et Firebase a des tâches on synchronise
  //         if (mysqlTasks.length === 0 && tasksData.length > 0) {
  //           for (const task of tasksData) {
  //             await createTache({
  //               name: task.name,
  //               priority: task.priority,
  //               done: task.done || false,
  //               inProgress: task.inProgress || false,
  //               dueDate: task.dueDate || "",
  //               projectId: task.projectId || 1,
  //             });
  //           }
  //           // Synchronisation des tâches réussie
  //           console.log("✅ Tâches synchronisées vers MySQL !");
  //         } else {
  //           // MySQL a déjà les tâches — pas besoin de synchroniser
  //           console.log("ℹ️ MySQL déjà synchronisé pour les tâches");
  //         }

  //         // Synchronisation globale réussie
  //         console.log("✅ Synchronisation Firebase → MySQL réussie !");
  //       } catch (error) {
  //         // Si l'API Symfony n'est pas disponible on continue en mode Firebase uniquement
  //         console.log(
  //           "⚠️ API Symfony non disponible — mode Firebase uniquement",
  //         );
  //       }
  //     } catch (error) {
  //       // Erreur générale de chargement des données
  //       console.error("Erreur chargement :", error);
  //     } finally {
  //       // Dans tous les cas on arrête l'écran de chargement
  //       setLoading(false);
  //     }
  //   }

  //   // On lance le chargement au démarrage de l'application
  //   loadData();
  // }, []);

  // Sauvegarde une tâche dans Firebase
  async function saveTask(task) {
    await setDoc(doc(db, "tasks", String(task.id)), task);
  }

  // Supprime une tâche dans Firebase
  async function deleteTask(id) {
    await deleteDoc(doc(db, "tasks", String(id)));
  }

  // Sauvegarde un projet dans Firebase
  async function saveProject(project) {
    await setDoc(doc(db, "projects", String(project.id)), project);
  }

  // Supprime un projet dans Firebase
  async function deleteProject(id) {
    await deleteDoc(doc(db, "projects", String(id)));
  }

  // =====================
  // FILTRAGE DES TÂCHES
  // =====================

  // On applique les deux filtres en chaîne sur la liste des tâches
  const filteredTasks = tasks
    // Filtre par priorité — si "toutes" on garde tout, sinon on filtre
    .filter((t) =>
      filterPriority === "toutes" ? true : t.priority === filterPriority,
    )
    // Filtre par projet — si "tous" on garde tout, sinon on compare les ids
    .filter((t) =>
      filterProject === "tous" ? true : t.projectId === parseInt(filterProject),
    );

  // =====================
  // CALCUL DES STATISTIQUES
  // =====================

  // Nombre total de tâches
  const totalTasks = tasks.length;

  // Nombre de tâches cochées comme terminées
  const doneTasks = tasks.filter((t) => t.done).length;

  // Nombre de tâches non terminées avec priorité haute
  const highPriority = tasks.filter(
    (t) => t.priority === "haute" && !t.done,
  ).length;

  // Nombre de projets avec le statut "En cours"
  const activeProjects = initialProjects.filter(
    (p) => p.status === "En cours",
  ).length;

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
  async function handleAdd({ name, priority }) {
    const newTask = {
      name,
      projectId: filterProject !== "tous" ? parseInt(filterProject) : 1,
      priority,
      done: false,
      inProgress: false,
      dueDate: "",
    };
    // On sauvegarde dans MySQL via Symfony
    const saved = await createTache(newTask);
    // On ajoute la tâche retournée par MySQL avec son vrai id
    setTasks([...tasks, saved]);
  }

  // Fonction pour retrouver le nom d'un projet
  function getProjectName(projectId) {
    const project = projects.find((p) => p.id === projectId);
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
  async function handleEdit(updatedTask) {
    // On met à jour l'affichage immédiatement
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    // On sauvegarde dans MySQL via Symfony
    await updateTache(updatedTask.id, updatedTask);
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

  // // Fonction pour cocher / décocher une tâche
  // async function handleToggle(id) {
  //   const task = tasks.find((t) => t.id === id);
  //   const updated = { ...task, done: !task.done };
  //   setTasks(tasks.map((t) => (t.id === id ? updated : t)));
  //   await saveTask(updated);
  // }

  // // Fonction pour ajouter une nouvelle tâche
  // async function handleAdd({ name, priority }) {
  //   const newTask = {
  //     id: Date.now(),
  //     name,
  //     projectId: filterProject !== "tous" ? parseInt(filterProject) : 1,
  //     priority,
  //     done: false,
  //     inProgress: false,
  //     dueDate: "",
  //   };
  //   setTasks([...tasks, newTask]);
  //   await saveTask(newTask);
  // }

  // // Fonction pour retrouver le nom d'un projet
  // function getProjectName(projectId) {
  //   const project = projects.find((p) => p.id === projectId);
  //   return project ? project.name : "Inconnu";
  // }

  // // Fonction pour ajouter un projet
  // async function handleAddProject(project) {
  //   setProjects([...projects, project]);
  //   await saveProject(project);
  // }

  // // Fonction pour supprimer une tâche
  // async function handleDelete(id) {
  //   setTasks(tasks.filter((t) => t.id !== id));
  //   await deleteTask(id);
  // }

  // // Fonction pour modifier une tâche
  // async function handleEdit(updatedTask) {
  //   setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  //   await saveTask(updatedTask);
  // }

  // // Fonction pour supprimer un projet
  // async function handleDeleteProject(id) {
  //   setProjects(projects.filter((p) => p.id !== id));
  //   await deleteProject(id);
  // }

  // // Fonction pour déplacer une tâche dans le Kanban
  // async function handleTaskMove(taskId, newStatus) {
  //   const task = tasks.find((t) => t.id === taskId);
  //   const updated = { ...task, ...newStatus };
  //   setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
  //   await saveTask(updated);
  // }
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
      {/* Écran de chargement pendant la connexion à Firebase */}
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
                {projects.map((project) => (
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
                      {projects.map((p) => (
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
                  {projects.map((p) => (
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
  );
}

export default App;
