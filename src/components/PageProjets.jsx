// Importation de useState pour gérer le formulaire d'ajout
import { useState } from "react"

function PageProjets({ projects, onAdd, onDelete }) {

  // =====================
  // ÉTATS DU FORMULAIRE
  // =====================

  // Nom du nouveau projet
  const [name, setName] = useState("")

  // Statut du nouveau projet
  const [status, setStatus] = useState("En cours")

  // Afficher ou cacher le formulaire d'ajout
  const [showForm, setShowForm] = useState(false)

  // =====================
  // COULEURS DISPONIBLES
  // =====================

  // Liste des couleurs disponibles pour les projets
  const colors = ["#378ADD", "#BA7517", "#639922", "#888780", "#D85A30", "#D4537E"]

  // Couleur sélectionnée par défaut
  const [selectedColor, setSelectedColor] = useState(colors[0])

  // =====================
  // FONCTION D'AJOUT
  // =====================

  function handleAdd() {
    // On vérifie que le nom n'est pas vide
    if (!name.trim()) return

    // On crée le nouveau projet
    onAdd({
      id: Date.now(),
      name,
      status,
      color: selectedColor,
      progress: 0, // Un nouveau projet commence à 0%
    })

    // On remet le formulaire à zéro
    setName("")
    setStatus("En cours")
    setSelectedColor(colors[0])
    setShowForm(false)
  }

  // =====================
  // STYLES RÉUTILISABLES
  // =====================

  const inputStyle = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "10px",
  }

  const selectStyle = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "10px",
    background: "#fff",
  }

  // =====================
  // RENDU DE LA PAGE
  // =====================

  return (
    <div>

      {/* ---- EN-TÊTE AVEC BOUTON AJOUTER ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "14px", color: "#999" }}>
          {projects.length} projet{projects.length > 1 ? "s" : ""} au total
        </div>

        {/* Bouton pour afficher le formulaire */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            fontSize: "13px",
            padding: "8px 16px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          {showForm ? "Annuler" : "+ Nouveau projet"}
        </button>
      </div>

      {/* ---- FORMULAIRE D'AJOUT ---- */}
      {showForm && (
        <div style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}>
            Nouveau projet
          </div>

          {/* Champ nom */}
          <input
            type="text"
            placeholder="Nom du projet..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            style={inputStyle}
          />

          {/* Sélection du statut */}
          <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
            <option value="En cours">En cours</option>
            <option value="En attente">En attente</option>
            <option value="Terminé">Terminé</option>
          </select>

          {/* Sélection de la couleur */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>Couleur</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {colors.map(color => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: color,
                    cursor: "pointer",
                    // Bordure blanche si couleur sélectionnée
                    border: selectedColor === color ? "3px solid #111" : "3px solid transparent",
                    transition: "border 0.15s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bouton de confirmation */}
          <button
            onClick={handleAdd}
            style={{
              width: "100%",
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
            Créer le projet
          </button>
        </div>
      )}

      {/* ---- GRILLE DES PROJETS ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
        {projects.map(project => (
          <div
            key={project.id}
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "1.25rem",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"
              e.currentTarget.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            {/* En-tête de la carte projet */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Point coloré */}
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: project.color }} />
                {/* Nom du projet */}
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{project.name}</div>
              </div>

              {/* Bouton supprimer */}
              <button
                onClick={() => onDelete(project.id)}
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  background: "#fff0f0",
                  color: "#c0392b",
                  border: "1px solid #fdd",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Supprimer
              </button>
            </div>

            {/* Barre de progression */}
            <div style={{ height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
              <div style={{
                height: "100%",
                width: `${project.progress}%`,
                background: project.color,
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }} />
            </div>

            {/* Infos bas de carte */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "12px", color: "#aaa" }}>{project.progress}% complété</div>

              {/* Badge statut */}
              <div style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: "500",
                background: project.status === "Terminé" ? "#EAF3DE"
                  : project.status === "En attente" ? "#FAEEDA"
                  : "#E6F1FB",
                color: project.status === "Terminé" ? "#3B6D11"
                  : project.status === "En attente" ? "#854F0B"
                  : "#185FA5",
              }}>
                {project.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PageProjets
