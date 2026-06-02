// =====================================================
// ExportPDF.jsx — Export PDF et Excel du rapport
// Génère un rapport complet avec statistiques,
// projets, tâches, sous-tâches et tags
// =====================================================
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";

function ExportPDF({ tasks, projects, users }) {
  // État de chargement
  const [loading, setLoading] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  // =====================
  // DONNÉES SÉCURISÉES
  // =====================
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // =====================
  // CALCUL DES STATISTIQUES
  // =====================
  const totalTasks = safeTasks.length;
  const doneTasks = safeTasks.filter((t) => t.done).length;
  const tauxCompletion = totalTasks
    ? Math.round((doneTasks / totalTasks) * 100)
    : 0;
  const activeProjects = safeProjects.filter(
    (p) => p.status === "En cours",
  ).length;

  // Tâches en retard
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const enRetard = safeTasks.filter((t) => {
    if (t.done || !t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  // Temps estimé total
  const tempsEstimeTotal = safeTasks.reduce(
    (acc, t) => acc + (t.estimatedTime || 0),
    0,
  );
  const tempsEstimeTotalH = Math.round((tempsEstimeTotal / 60) * 10) / 10;

  // Sous-tâches
  const totalSousTaches = safeTasks.reduce(
    (acc, t) => acc + (t.subTasks?.length || 0),
    0,
  );
  const sousTachesTerminees = safeTasks.reduce(
    (acc, t) => acc + (t.subTasks?.filter((st) => st.done).length || 0),
    0,
  );

  // =====================
  // FONCTIONS UTILITAIRES
  // =====================

  // Trouve le nom du projet
  function getProjectName(projectId) {
    const project = safeProjects.find((p) => p.id === projectId);
    return project ? project.name : "Inconnu";
  }

  // Trouve l'email de l'utilisateur assigné
  function getUserEmail(userId) {
    if (!userId) return "—";
    const user = safeUsers.find((u) => u.id === userId);
    return user ? user.email : "Inconnu";
  }

  // Couleur de priorité
  function getPriorityStyle(priority) {
    switch (priority) {
      case "critique":
        return { bg: "#FCEBEB", color: "#A32D2D" };
      case "haute":
        return { bg: "#FAEEDA", color: "#854F0B" };
      case "normale":
        return { bg: "#E8F4FD", color: "#1976D2" };
      case "basse":
        return { bg: "#EAF3DE", color: "#3B6D11" };
      default:
        return { bg: "#f0f0f0", color: "#666" };
    }
  }

  // =====================
  // EXPORT PDF
  // =====================
  async function handleExportPDF() {
    setLoading(true);
    try {
      const element = document.getElementById("pdf-content");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-${new Date().toLocaleDateString("fr-FR")}.pdf`);
    } catch (error) {
      console.error("Erreur export PDF :", error);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // EXPORT EXCEL (CSV)
  // =====================
  function handleExportExcel() {
    setLoadingExcel(true);

    try {
      // En-têtes du CSV
      const headers = [
        "Nom",
        "Projet",
        "Priorité",
        "Statut",
        "Date échéance",
        "Temps estimé (min)",
        "Assigné à",
        "Tags",
        "Sous-tâches",
      ];

      // Données des tâches
      const rows = safeTasks.map((task) => [
        task.name,
        getProjectName(task.projectId),
        task.priority || "",
        task.done ? "Terminée" : task.inProgress ? "En cours" : "À faire",
        task.dueDate || "",
        task.estimatedTime || "",
        getUserEmail(task.assignedTo),
        (task.tags || []).join(", "),
        `${task.subTasks?.filter((st) => st.done).length || 0}/${task.subTasks?.length || 0}`,
      ]);

      // Génère le CSV
      const csvContent = [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      // Télécharge le fichier
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `taches-${new Date().toLocaleDateString("fr-FR")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur export Excel :", error);
    } finally {
      setLoadingExcel(false);
    }
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div>
      {/* ---- BOUTONS D'EXPORT ---- */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginBottom: "1.5rem",
        }}
      >
        {/* Export Excel/CSV */}
        <button
          onClick={handleExportExcel}
          disabled={loadingExcel}
          style={{
            fontSize: "13px",
            padding: "10px 20px",
            background: loadingExcel ? "#aaa" : "#217346",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loadingExcel ? "not-allowed" : "pointer",
            fontWeight: "500",
          }}
        >
          {loadingExcel ? "Export..." : "📊 Exporter en Excel"}
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPDF}
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

      {/* ---- CONTENU DU RAPPORT ---- */}
      <div
        id="pdf-content"
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          border: "1px solid #eee",
        }}
      >
        {/* En-tête */}
        <div
          style={{
            marginBottom: "2rem",
            borderBottom: "2px solid #111",
            paddingBottom: "1rem",
          }}
        >
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#111" }}>
            📊 Rapport Project Manager
          </div>
          <div style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
            Généré le{" "}
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Statistiques globales */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#111",
            }}
          >
            Statistiques globales
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
            }}
          >
            {[
              {
                label: "Projets actifs",
                value: activeProjects,
                color: "#378ADD",
              },
              {
                label: "Complétion",
                value: `${tauxCompletion}%`,
                color: "#639922",
              },
              {
                label: "En retard",
                value: enRetard,
                color: enRetard > 0 ? "#e74c3c" : "#639922",
              },
              {
                label: "Temps estimé",
                value: `${tempsEstimeTotalH}h`,
                color: "#BA7517",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#999",
                    marginBottom: "4px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sous-tâches stats */}
        <div
          style={{
            marginBottom: "2rem",
            background: "#f9f9f9",
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "500",
              color: "#333",
              marginBottom: "6px",
            }}
          >
            Sous-tâches : {sousTachesTerminees}/{totalSousTaches} terminées
          </div>
          <div
            style={{
              height: "6px",
              background: "#e0e0e0",
              borderRadius: "3px",
            }}
          >
            <div
              style={{
                height: "100%",
                width:
                  totalSousTaches > 0
                    ? `${Math.round((sousTachesTerminees / totalSousTaches) * 100)}%`
                    : "0%",
                background: "#639922",
                borderRadius: "3px",
              }}
            />
          </div>
        </div>

        {/* Liste des projets */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#111",
            }}
          >
            Projets ({safeProjects.length})
          </div>
          {safeProjects.map((project) => (
            <div
              key={project.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: project.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, fontSize: "13px", fontWeight: "500" }}>
                {project.name}
              </div>
              <div
                style={{
                  width: "120px",
                  height: "5px",
                  background: "#eee",
                  borderRadius: "3px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${project.progress}%`,
                    background: project.color,
                    borderRadius: "3px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#888",
                  width: "35px",
                  textAlign: "right",
                }}
              >
                {project.progress}%
              </div>
              <div
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  background:
                    project.status === "Terminé"
                      ? "#EAF3DE"
                      : project.status === "En attente"
                        ? "#FAEEDA"
                        : "#E6F1FB",
                  color:
                    project.status === "Terminé"
                      ? "#3B6D11"
                      : project.status === "En attente"
                        ? "#854F0B"
                        : "#185FA5",
                }}
              >
                {project.status}
              </div>
            </div>
          ))}
        </div>

        {/* Liste des tâches */}
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#111",
            }}
          >
            Tâches ({totalTasks})
          </div>
          {safeTasks.map((task) => {
            const pStyle = getPriorityStyle(task.priority);
            const subTotal = task.subTasks?.length || 0;
            const subDone = task.subTasks?.filter((st) => st.done).length || 0;

            return (
              <div
                key={task.id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {/* Ligne principale */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "3px",
                      background: task.done ? "#639922" : "#eee",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      color: task.done ? "#aaa" : "#222",
                      textDecoration: task.done ? "line-through" : "none",
                      fontWeight: "500",
                    }}
                  >
                    {task.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>
                    {getProjectName(task.projectId)}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      padding: "2px 7px",
                      borderRadius: "20px",
                      background: pStyle.bg,
                      color: pStyle.color,
                    }}
                  >
                    {task.priority}
                  </div>
                  {task.dueDate && (
                    <div style={{ fontSize: "11px", color: "#bbb" }}>
                      📅 {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                  {task.assignedTo && (
                    <div style={{ fontSize: "11px", color: "#aaa" }}>
                      👤 {getUserEmail(task.assignedTo)}
                    </div>
                  )}
                </div>

                {/* Description */}
                {task.description && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "4px",
                      marginLeft: "24px",
                    }}
                  >
                    {task.description}
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      marginTop: "4px",
                      marginLeft: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    {task.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          borderRadius: "20px",
                          background: "#f0f0f0",
                          color: "#666",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sous-tâches */}
                {subTotal > 0 && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "4px",
                      marginLeft: "24px",
                    }}
                  >
                    ✅ {subDone}/{subTotal} sous-tâches
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ExportPDF;
