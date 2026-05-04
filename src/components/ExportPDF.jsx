// Importation des bibliothèques pour générer le PDF
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useState } from "react"

function ExportPDF({ tasks, projects }) {

  // État de chargement pendant la génération du PDF
  const [loading, setLoading] = useState(false)

  // =====================
  // CALCUL DES STATISTIQUES
  // =====================

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.done).length
  const highPriority = tasks.filter(t => t.priority === "haute" && !t.done).length
  const activeProjects = projects.filter(p => p.status === "En cours").length
  const tauxCompletion = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0

  // Tâches en retard
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const enRetard = tasks.filter(t => {
    if (t.done || !t.dueDate) return false
    return new Date(t.dueDate) < today
  }).length

  // =====================
  // FONCTION D'EXPORT PDF
  // =====================

  async function handleExport() {
    setLoading(true)

    try {
      // On récupère l'élément à capturer
      const element = document.getElementById("pdf-content")

      // On capture l'élément en image
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      // On crée le PDF en format A4
      const pdf = new jsPDF("p", "mm", "a4")
      const imgData = canvas.toDataURL("image/png")

      // Dimensions A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      // On ajoute l'image au PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

      // On télécharge le PDF
      pdf.save(`rapport-projets-${new Date().toLocaleDateString("fr-FR")}.pdf`)

    } catch (error) {
      console.error("Erreur export PDF :", error)
    } finally {
      setLoading(false)
    }
  }

  // =====================
  // RENDU
  // =====================

  return (
    <div>

      {/* Bouton d'export */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button
          onClick={handleExport}
          disabled={loading}
          style={{
            fontSize: "13px",
            padding: "10px 20px",
            background: loading ? "#aaa" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "500",
          }}
        >
          {loading ? "Génération..." : "📄 Exporter en PDF"}
        </button>
      </div>

      {/* Contenu du rapport qui sera capturé */}
      <div id="pdf-content" style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid #eee" }}>

        {/* En-tête du rapport */}
        <div style={{ marginBottom: "2rem", borderBottom: "2px solid #111", paddingBottom: "1rem" }}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#111" }}>
            📊 Rapport Project Manager
          </div>
          <div style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
            Généré le {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Statistiques globales */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "1rem", color: "#111" }}>
            Statistiques globales
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {[
              { label: "Projets actifs", value: activeProjects, color: "#378ADD" },
              { label: "Tâches totales", value: totalTasks, color: "#111" },
              { label: "Complétion", value: `${tauxCompletion}%`, color: "#639922" },
              { label: "En retard", value: enRetard, color: enRetard > 0 ? "#e74c3c" : "#639922" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#f9f9f9", borderRadius: "8px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>{stat.label}</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Liste des projets */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "1rem", color: "#111" }}>
            Projets
          </div>
          {projects.map(project => (
            <div key={project.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 0",
              borderBottom: "1px solid #f0f0f0",
            }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: project.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: "13px", fontWeight: "500" }}>{project.name}</div>
              <div style={{ width: "150px", height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${project.progress}%`, background: project.color, borderRadius: "3px" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#888", width: "40px", textAlign: "right" }}>{project.progress}%</div>
              <div style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "20px",
                background: project.status === "Terminé" ? "#EAF3DE" : project.status === "En attente" ? "#FAEEDA" : "#E6F1FB",
                color: project.status === "Terminé" ? "#3B6D11" : project.status === "En attente" ? "#854F0B" : "#185FA5",
              }}>
                {project.status}
              </div>
            </div>
          ))}
        </div>

        {/* Liste des tâches */}
        <div>
          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "1rem", color: "#111" }}>
            Tâches
          </div>
          {tasks.map(task => {
            const project = projects.find(p => p.id === task.projectId)
            return (
              <div key={task.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}>
                {/* Statut */}
                <div style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "3px",
                  background: task.done ? "#639922" : "#eee",
                  flexShrink: 0,
                }} />
                {/* Nom */}
                <div style={{
                  flex: 1,
                  fontSize: "12px",
                  color: task.done ? "#aaa" : "#222",
                  textDecoration: task.done ? "line-through" : "none",
                }}>
                  {task.name}
                </div>
                {/* Projet */}
                <div style={{ fontSize: "11px", color: "#aaa", width: "130px" }}>
                  {project ? project.name : ""}
                </div>
                {/* Priorité */}
                <div style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  borderRadius: "20px",
                  background: task.priority === "haute" ? "#FCEBEB" : task.priority === "moyenne" ? "#FAEEDA" : "#EAF3DE",
                  color: task.priority === "haute" ? "#A32D2D" : task.priority === "moyenne" ? "#854F0B" : "#3B6D11",
                }}>
                  {task.priority}
                </div>
                {/* Date */}
                {task.dueDate && (
                  <div style={{ fontSize: "11px", color: "#bbb", width: "80px", textAlign: "right" }}>
                    {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default ExportPDF