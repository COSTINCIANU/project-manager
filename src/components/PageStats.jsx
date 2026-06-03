// =====================================================
// PageStats.jsx — Page des statistiques avancées
// Affiche des graphiques et métriques sur les projets
// et les tâches avec recharts
// =====================================================
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

function PageStats({ tasks, projects, users }) {
  // =====================
  // VÉRIFICATION DES DONNÉES
  // =====================
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // =====================
  // CALCUL DES STATISTIQUES
  // =====================

  // Taux de complétion global
  const tauxCompletion = safeTasks.length
    ? Math.round(
        (safeTasks.filter((t) => t.done).length / safeTasks.length) * 100,
      )
    : 0;

  // Tâches en retard
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const enRetard = safeTasks.filter((t) => {
    if (t.done || !t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  // Temps total estimé en heures
  const tempsEstimeTotalMin = safeTasks.reduce(
    (acc, t) => acc + (t.estimatedTime || 0),
    0,
  );
  const tempsEstimeTotalH = Math.round((tempsEstimeTotalMin / 60) * 10) / 10;

  // Total sous-tâches
  const totalSousTaches = safeTasks.reduce(
    (acc, t) => acc + (t.subTasks?.length || 0),
    0,
  );
  const sousTachesTerminees = safeTasks.reduce(
    (acc, t) => acc + (t.subTasks?.filter((st) => st.done).length || 0),
    0,
  );

  // =====================
  // DONNÉES GRAPHIQUES
  // =====================

  // Répartition par priorité (avec critique)
  const dataPriorite = [
    {
      name: "Critique",
      value: safeTasks.filter((t) => t.priority === "critique").length,
      color: "#e74c3c",
    },
    {
      name: "Haute",
      value: safeTasks.filter((t) => t.priority === "haute").length,
      color: "#e67e22",
    },
    {
      name: "Normale",
      value: safeTasks.filter((t) => t.priority === "normale").length,
      color: "#378ADD",
    },
    {
      name: "Basse",
      value: safeTasks.filter((t) => t.priority === "basse").length,
      color: "#639922",
    },
    {
      name: "Moyenne",
      value: safeTasks.filter((t) => t.priority === "moyenne").length,
      color: "#9B59B6",
    },
  ].filter((d) => d.value > 0);

  // Statut des tâches
  const dataStatut = [
    {
      name: "Terminées",
      value: safeTasks.filter((t) => t.done).length,
      color: "#639922",
    },
    {
      name: "En cours",
      value: safeTasks.filter((t) => t.inProgress && !t.done).length,
      color: "#378ADD",
    },
    {
      name: "À faire",
      value: safeTasks.filter((t) => !t.done && !t.inProgress).length,
      color: "#aaa",
    },
  ].filter((d) => d.value > 0);

  // Tâches par projet
  const dataTachesParProjet = safeProjects.map((p) => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
    total: safeTasks.filter((t) => t.projectId === p.id).length,
    terminees: safeTasks.filter((t) => t.projectId === p.id && t.done).length,
    enRetard: safeTasks.filter((t) => {
      if (t.projectId !== p.id || t.done || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length,
    color: p.color || "#378ADD",
  }));

  // Tâches assignées par utilisateur
  const dataTachesParUser = safeUsers
    .map((u) => ({
      name: u.email.split("@")[0],
      total: safeTasks.filter((t) => t.assignedTo === u.id).length,
      terminees: safeTasks.filter((t) => t.assignedTo === u.id && t.done)
        .length,
    }))
    .filter((u) => u.total > 0);

  // =====================
  // TOOLTIP PERSONNALISÉ
  // =====================
  function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "500" }}>{payload[0].name}</div>
          <div style={{ color: "#666" }}>
            {payload[0].value} tâche{payload[0].value > 1 ? "s" : ""}
          </div>
        </div>
      );
    }
    return null;
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ maxWidth: "100%", overflow: "hidden" }}>
      {/* ---- CARTES RÉSUMÉ ---- */}
      {/* Dive de card Stat avant sur descktop etait  gridTemplateColumns: "repeat(4, 1fr)", */}
      <div
        style={{
          display: "grid",
          // Mainthna en mode mobile 375px iphone SE
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
          marginBottom: "1.5rem",
        }}
      >
        {/* Complétion globale */}
        <div
          className="stat-cards-primary"
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            Complétion globale
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#378ADD" }}
          >
            {tauxCompletion}%
          </div>
          <div
            style={{
              height: "4px",
              background: "#eee",
              borderRadius: "2px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${tauxCompletion}%`,
                background: "#378ADD",
                borderRadius: "2px",
              }}
            />
          </div>
        </div>

        {/* Tâches terminées */}
        <div
          className="stat-cards-primary"
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            Tâches terminées
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#639922" }}
          >
            {safeTasks.filter((t) => t.done).length}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
            sur {safeTasks.length} tâches
          </div>
        </div>

        {/* Tâches en retard */}
        <div
          className="stat-cards-primary"
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            En retard
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: enRetard > 0 ? "#e74c3c" : "#639922",
            }}
          >
            {enRetard}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
            tâche{enRetard > 1 ? "s" : ""} en retard
          </div>
        </div>

        {/* Temps estimé total */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            Temps estimé total
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#BA7517" }}
          >
            {tempsEstimeTotalH}h
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
            sur toutes les tâches
          </div>
        </div>
      </div>

      {/* ---- CARTES SECONDAIRES ---- */}
      <div
        className="stat-cards-secondary"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          marginBottom: "1.5rem",
        }}
      >
        {/* Projets actifs */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            Projets actifs
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#9B59B6" }}
          >
            {safeProjects.filter((p) => p.status === "En cours").length}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
            sur {safeProjects.length} projets
          </div>
        </div>

        {/* Sous-tâches */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            Sous-tâches
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#00695C" }}
          >
            {sousTachesTerminees}/{totalSousTaches}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
            terminées
          </div>
        </div>

        {/* Membres actifs */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
            Membres actifs
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#1976D2" }}
          >
            {safeUsers.length}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
            utilisateurs
          </div>
        </div>
      </div>

      {/* ---- GRAPHIQUES CAMEMBERT ---- */}
      <div
        className="charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        {/* Priorités */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "1rem",
            }}
          >
            Répartition par priorité
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            {dataPriorite.map((d) => {
              const pct =
                safeTasks.length > 0
                  ? Math.round((d.value / safeTasks.length) * 100)
                  : 0;
              return (
                <div key={d.name} style={{ textAlign: "center", width: "45%" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "70px",
                      height: "70px",
                      margin: "0 auto 6px",
                    }}
                  >
                    <svg width="70" height="70" viewBox="0 0 70 70">
                      <circle
                        cx="35"
                        cy="35"
                        r="28"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="35"
                        cy="35"
                        r="28"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="8"
                        strokeDasharray={`${pct * 1.759} 175.9`}
                        strokeLinecap="round"
                        transform="rotate(-90 35 35)"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {d.value}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    {d.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statut */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "1rem",
            }}
          >
            Statut des tâches
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            {dataStatut.map((d) => {
              const pct =
                safeTasks.length > 0
                  ? Math.round((d.value / safeTasks.length) * 100)
                  : 0;
              return (
                <div key={d.name} style={{ textAlign: "center", width: "45%" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "70px",
                      height: "70px",
                      margin: "0 auto 6px",
                    }}
                  >
                    <svg width="70" height="70" viewBox="0 0 70 70">
                      <circle
                        cx="35"
                        cy="35"
                        r="28"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="35"
                        cy="35"
                        r="28"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="8"
                        strokeDasharray={`${pct * 1.759} 175.9`}
                        strokeLinecap="round"
                        transform="rotate(-90 35 35)"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {d.value}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    {d.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- GRAPHIQUE BARRES PROJETS ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "14px",
        }}
      >
        <div
          style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}
        >
          Tâches par projet
        </div>
        {dataTachesParProjet.length === 0 ? (
          <div
            style={{
              fontSize: "13px",
              color: "#aaa",
              textAlign: "center",
              padding: "1rem",
            }}
          >
            Aucun projet
          </div>
        ) : (
          dataTachesParProjet.map((p, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#333", fontWeight: "500" }}>
                  {p.name}
                </span>
                <span style={{ color: "#888" }}>
                  {p.terminees}/{p.total} terminées
                </span>
              </div>
              <div
                style={{
                  height: "10px",
                  background: "#f0f0f0",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${p.total > 0 ? (p.terminees / p.total) * 100 : 0}%`,
                    background: p.color,
                    borderRadius: "5px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              {p.enRetard > 0 && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#e74c3c",
                    marginTop: "3px",
                  }}
                >
                  ⚠️ {p.enRetard} en retard
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ---- GRAPHIQUE BARRES UTILISATEURS ---- */}
      {/* ---- PRODUCTIVITÉ PAR MEMBRE ---- */}
      {dataTachesParUser.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "1rem",
            }}
          >
            Productivité par membre
          </div>
          {dataTachesParUser.map((u, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#333", fontWeight: "500" }}>
                  👤 {u.name}
                </span>
                <span style={{ color: "#888" }}>
                  {u.terminees}/{u.total} terminées
                </span>
              </div>
              <div
                style={{
                  height: "10px",
                  background: "#f0f0f0",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${u.total > 0 ? (u.terminees / u.total) * 100 : 0}%`,
                    background: "#378ADD",
                    borderRadius: "5px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageStats;
