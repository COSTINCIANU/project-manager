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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "1.5rem",
        }}
      >
        {/* Complétion globale */}
        <div
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
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        {/* Camembert priorités */}
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
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataPriorite}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {dataPriorite.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            {dataPriorite.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  color: "#666",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: d.color,
                  }}
                />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Camembert statut */}
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
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataStatut}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {dataStatut.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            {dataStatut.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  color: "#666",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: d.color,
                  }}
                />
                {d.name} ({d.value})
              </div>
            ))}
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
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataTachesParProjet} barSize={24}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9f9f9" }} />
            <Bar
              dataKey="total"
              name="Total"
              radius={[4, 4, 0, 0]}
              fill="#eee"
            />
            <Bar dataKey="terminees" name="Terminées" radius={[4, 4, 0, 0]}>
              {dataTachesParProjet.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
            <Bar
              dataKey="enRetard"
              name="En retard"
              radius={[4, 4, 0, 0]}
              fill="#FCEBEB"
            />
          </BarChart>
        </ResponsiveContainer>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "8px",
          }}
        >
          {[
            { color: "#eee", label: "Total" },
            { color: "#639922", label: "Terminées" },
            { color: "#FCEBEB", label: "En retard" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                color: "#666",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "8px",
                  borderRadius: "2px",
                  background: item.color,
                  border: "1px solid #ddd",
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ---- GRAPHIQUE BARRES UTILISATEURS ---- */}
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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataTachesParUser} barSize={24}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#999" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#999" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f9f9f9" }}
              />
              <Bar
                dataKey="total"
                name="Total"
                radius={[4, 4, 0, 0]}
                fill="#E8F4FD"
              />
              <Bar
                dataKey="terminees"
                name="Terminées"
                radius={[4, 4, 0, 0]}
                fill="#378ADD"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default PageStats;
