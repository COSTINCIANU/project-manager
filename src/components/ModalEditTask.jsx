// Importation de useState pour gérer les champs du formulaire
import { useState } from "react"

function ModalEditTask({ task, projects, onSave, onClose }) {

  // =====================
  // ÉTATS DU FORMULAIRE
  // =====================

  // Nom de la tâche — initialisé avec la valeur actuelle
  const [name, setName] = useState(task.name)

  // Priorité — initialisée avec la valeur actuelle
  const [priority, setPriority] = useState(task.priority)

  // Projet — initialisé avec la valeur actuelle
  const [projectId, setProjectId] = useState(task.projectId)

  // Date d'échéance — initialisée avec la valeur actuelle
  const [dueDate, setDueDate] = useState(task.dueDate || "") 

  // =====================
  // FONCTION DE SAUVEGARDE
  // =====================

  function handleSave() {
    // On vérifie que le nom n'est pas vide
    if (!name.trim()) return

    // On envoie la tâche modifiée au composant parent
    onSave({
      ...task,
      name,
      priority,
      projectId: parseInt(projectId),
      dueDate, // On sauvegarde la date d'échéance
    })

    // On ferme la modal
    onClose()
  }

  // =====================
  // STYLES
  // =====================

  const inputStyle = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px",
    background: "#fff",
  }

  const selectStyle = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px",
    background: "#fff",
  }

  // =====================
  // RENDU DE LA MODAL
  // =====================

  return (
    // Fond sombre derrière la modal — clic dessus pour fermer
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Boîte de la modal — on stoppe la propagation du clic */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "1.5rem",
          width: "400px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "15px", fontWeight: "500" }}>Modifier la tâche</div>
          <div
            onClick={onClose}
            style={{ cursor: "pointer", color: "#aaa", fontSize: "18px", lineHeight: 1 }}
          >
            ✕
          </div>
        </div>

        {/* Champ nom */}
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>Nom de la tâche</div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          style={inputStyle}
          autoFocus
        />

        {/* Champ priorité */}
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>Priorité</div>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
          <option value="haute">Haute</option>
          <option value="moyenne">Moyenne</option>
          <option value="basse">Basse</option>
        </select>

        {/* Champ projet */}
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>Projet</div>
        <select value={projectId} onChange={e => setProjectId(e.target.value)} style={selectStyle}>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Champ date d'échéance */}
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>Date d'échéance</div>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={inputStyle}
        />
        
        {/* Boutons */}
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          {/* Bouton annuler */}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              background: "#f5f5f5",
              color: "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Annuler
          </button>

          {/* Bouton sauvegarder */}
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "10px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalEditTask