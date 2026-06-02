// =====================================================
// AddTaskForm.jsx — Formulaire d'ajout rapide d'une tâche
// Permet de créer une tâche avec les champs essentiels :
// nom, priorité, date d'échéance et description
// =====================================================
import { useState } from "react";

function AddTaskForm({ onAdd }) {
  // =====================
  // ÉTATS DU FORMULAIRE
  // =====================

  // Nom de la tâche
  const [name, setName] = useState("");

  // Priorité : critique, haute, normale, basse
  const [priority, setPriority] = useState("normale");

  // Date d'échéance optionnelle
  const [dueDate, setDueDate] = useState("");

  // Description courte optionnelle
  const [description, setDescription] = useState("");

  // Afficher ou masquer les champs optionnels
  const [showMore, setShowMore] = useState(false);

  // =====================
  // SOUMISSION DU FORMULAIRE
  // =====================

  function handleSubmit() {
    // On vérifie que le nom n'est pas vide
    if (!name.trim()) return;

    // On envoie la nouvelle tâche au composant parent (App.jsx)
    onAdd({
      name,
      priority,
      dueDate: dueDate || null,
      description: description || null,
      done: false,
      inProgress: false,
      tags: [],
      subTasks: [],
    });

    // On remet le formulaire à zéro
    setName("");
    setPriority("normale");
    setDueDate("");
    setDescription("");
    setShowMore(false);
  }

  // =====================
  // RENDU DU FORMULAIRE
  // =====================

  return (
    <div
      style={{
        marginTop: "1rem",
        paddingTop: "1rem",
        borderTop: "1px solid #f0f0f0",
      }}
    >
      {/* ---- LIGNE PRINCIPALE ---- */}
      <div
        className="add-task-form"
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: showMore ? "8px" : "0",
        }}
      >
        {/* Champ nom de la tâche */}
        <input
          type="text"
          placeholder="Nouvelle tâche..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            flex: 1,
            fontSize: "13px",
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            outline: "none",
          }}
        />

        {/* Sélecteur de priorité */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            fontSize: "12px",
            padding: "6px 8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            color: "#666",
            background: "#fff",
          }}
        >
          <option value="critique">🔴 Critique</option>
          <option value="haute">🟠 Haute</option>
          <option value="normale">🟡 Normale</option>
          <option value="basse">🟢 Basse</option>
        </select>

        {/* Bouton afficher/masquer les champs optionnels */}
        <button
          onClick={() => setShowMore(!showMore)}
          style={{
            fontSize: "12px",
            padding: "6px 10px",
            background: showMore ? "#f0f0f0" : "#fff",
            color: "#888",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          title="Plus d'options"
        >
          {showMore ? "▲" : "▼"}
        </button>

        {/* Bouton ajouter */}
        <button
          onClick={handleSubmit}
          style={{
            fontSize: "12px",
            padding: "6px 14px",
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Ajouter
        </button>
      </div>

      {/* ---- CHAMPS OPTIONNELS (affichés si showMore = true) ---- */}
      {showMore && (
        <div
          style={{
            background: "#f9f9f9",
            borderRadius: "8px",
            padding: "12px",
            marginTop: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Champ description */}
          <div>
            <div
              style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}
            >
              Description
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la tâche..."
              style={{
                width: "100%",
                fontSize: "13px",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                outline: "none",
                resize: "vertical",
                minHeight: "60px",
                fontFamily: "sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Champ date d'échéance */}
          <div>
            <div
              style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}
            >
              Date d'échéance
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                fontSize: "13px",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                outline: "none",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AddTaskForm;
