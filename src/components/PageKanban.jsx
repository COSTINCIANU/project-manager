// Importation des outils drag & drop de dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

// =====================
// COMPOSANT CARTE TÂCHE DRAGGABLE
// =====================

function KanbanCard({ task, projectName }) {

  // useSortable donne accès aux props de drag & drop pour cet élément
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  // Style de transformation pendant le drag
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "12px 14px",
        marginBottom: "8px",
        cursor: "grab",
        boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
        transition: "box-shadow 0.2s",
      }}>
        {/* Nom de la tâche */}
        <div style={{ fontSize: "13px", fontWeight: "500", color: "#222", marginBottom: "6px" }}>
          {task.name}
        </div>

        {/* Projet + priorité */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "11px", color: "#aaa" }}>{projectName}</div>
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
        </div>

        {/* Date d'échéance si elle existe */}
        {task.dueDate && (
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "6px" }}>
            📅 {new Date(task.dueDate).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>
    </div>
  )
}

// =====================
// COMPOSANT COLONNE KANBAN
// =====================

function KanbanColonne({ title, tasks, projects, color, count }) {

  // On récupère les ids des tâches pour SortableContext
  const taskIds = tasks.map(t => t.id)

  // Fonction pour trouver le nom du projet
  function getProjectName(projectId) {
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : "Inconnu"
  }

  return (
    <div style={{
      background: "#f9f9f9",
      borderRadius: "14px",
      padding: "1rem",
      minHeight: "500px",
      flex: 1,
    }}>

      {/* En-tête de la colonne */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
        <div style={{ fontSize: "14px", fontWeight: "500" }}>{title}</div>
        <div style={{
          marginLeft: "auto",
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "20px",
          background: "#eee",
          color: "#888",
        }}>
          {count}
        </div>
      </div>

      {/* Liste des tâches draggables */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {tasks.length === 0 ? (
          <div style={{
            fontSize: "13px",
            color: "#ccc",
            textAlign: "center",
            padding: "2rem 0",
            border: "2px dashed #eee",
            borderRadius: "10px",
          }}>
            Aucune tâche
          </div>
        ) : (
          tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              projectName={getProjectName(task.projectId)}
            />
          ))
        )}
      </SortableContext>
    </div>
  )
}

// =====================
// COMPOSANT PRINCIPAL KANBAN
// =====================

function PageKanban({ tasks, projects, onTaskMove }) {

  // Configuration du capteur de drag — nécessite 8px de mouvement avant de démarrer
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // On répartit les tâches dans les 3 colonnes selon leur statut
  const tachesAFaire = tasks.filter(t => !t.done && !t.inProgress)
  const tachesEnCours = tasks.filter(t => t.inProgress && !t.done)
  const tachesTerminees = tasks.filter(t => t.done)

  // Fonction appelée quand on lâche une carte après le drag
  function handleDragEnd(event) {
    const { active, over } = event

    // Si on n'a pas de destination valide on arrête
    if (!over) return

    // On trouve la tâche déplacée
    const taskId = active.id

    // On trouve dans quelle colonne se trouve la destination
    const isOverAFaire = tachesAFaire.some(t => t.id === over.id)
    const isOverEnCours = tachesEnCours.some(t => t.id === over.id)
    const isOverTerminee = tachesTerminees.some(t => t.id === over.id)

    // On met à jour le statut de la tâche selon la colonne de destination
    if (isOverAFaire) {
      onTaskMove(taskId, { done: false, inProgress: false })
    } else if (isOverEnCours) {
      onTaskMove(taskId, { done: false, inProgress: true })
    } else if (isOverTerminee) {
      onTaskMove(taskId, { done: true, inProgress: false })
    }
  }

  return (
    <div>
      {/* ---- BOARD KANBAN ---- */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>

          {/* Colonne À faire */}
          <KanbanColonne
            title="À faire"
            tasks={tachesAFaire}
            projects={projects}
            color="#888780"
            count={tachesAFaire.length}
          />

          {/* Colonne En cours */}
          <KanbanColonne
            title="En cours"
            tasks={tachesEnCours}
            projects={projects}
            color="#378ADD"
            count={tachesEnCours.length}
          />

          {/* Colonne Terminées */}
          <KanbanColonne
            title="Terminées"
            tasks={tachesTerminees}
            projects={projects}
            color="#639922"
            count={tachesTerminees.length}
          />

        </div>
      </DndContext>
    </div>
  )
}

export default PageKanban