import { useState } from "react"

function AddTaskForm({ onAdd }) {
  const [name, setName] = useState("")
  const [priority, setPriority] = useState("moyenne")

  function handleSubmit() {
    if (!name.trim()) return
    onAdd({ name, priority })
    setName("")
    setPriority("moyenne")
  }

  return (
    <div style={{
      display: "flex",
      gap: "8px",
      marginTop: "1rem",
      paddingTop: "1rem",
      borderTop: "1px solid #f0f0f0",
    }}>
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

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{
          fontSize: "12px",
          padding: "6px 8px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          color: "#666",
        }}
      >
        <option value="haute">Haute</option>
        <option value="moyenne">Moyenne</option>
        <option value="basse">Basse</option>
      </select>

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
  )
}

export default AddTaskForm