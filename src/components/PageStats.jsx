// Importation des composants Recharts pour les graphiques
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

function PageStats({ tasks, projects }) {

  // =====================
  // CALCUL DES DONNÉES
  // =====================

  // Données pour le graphique camembert — répartition par priorité
  const dataPriorite = [
    { name: "Haute", value: tasks.filter(t => t.priority === "haute").length, color: "#e74c3c" },
    { name: "Moyenne", value: tasks.filter(t => t.priority === "moyenne").length, color: "#e67e22" },
    { name: "Basse", value: tasks.filter(t => t.priority === "basse").length, color: "#639922" },
  ].filter(d => d.value > 0)

  // Données pour le graphique camembert — répartition terminé / en cours
  const dataStatut = [
    { name: "Terminées", value: tasks.filter(t => t.done).length, color: "#639922" },
    { name: "En cours", value: tasks.filter(t => !t.done).length, color: "#378ADD" },
  ].filter(d => d.value > 0)

  // Données pour le graphique barres — tâches par projet
  const dataTachesParProjet = projects.map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
    total: tasks.filter(t => t.projectId === p.id).length,
    terminees: tasks.filter(t => t.projectId === p.id && t.done).length,
    color: p.color,
  }))

  // Calcul du taux de complétion global
  const tauxCompletion = tasks.length
    ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100)
    : 0

  // Tâches en retard
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const enRetard = tasks.filter(t => {
    if (t.done || !t.dueDate) return false
    return new Date(t.dueDate) < today
  }).length

  // =====================
  // COMPOSANT TOOLTIP
  // =====================

  function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
        }}>
          <div style={{ fontWeight: "500" }}>{payload[0].name}</div>
          <div style={{ color: "#666" }}>{payload[0].value} tâche{payload[0].value > 1 ? "s" : ""}</div>
        </div>
      )
    }
    return null
  }

  // =====================
  // RENDU DE LA PAGE
  // =====================

  // Le minWidth: 0 sur les grilles empêche le contenu de déborder
  // et de pousser la sidebar hors de l'écran
  return (
    <div style={{ maxWidth: "100%", overflow: "hidden" }}>

      {/* ---- CARTES RÉSUMÉ ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "1.5rem", minWidth: 0 }}>

        {/* Taux de complétion */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px 18px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>Complétion globale</div>
          <div style={{ fontSize: "24px", fontWeight: "600", color: "#378ADD" }}>{tauxCompletion}%</div>
          <div style={{ height: "4px", background: "#eee", borderRadius: "2px", marginTop: "8px" }}>
            <div style={{ height: "100%", width: `${tauxCompletion}%`, background: "#378ADD", borderRadius: "2px" }} />
          </div>
        </div>

        {/* Tâches terminées */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px 18px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>Tâches terminées</div>
          <div style={{ fontSize: "24px", fontWeight: "600", color: "#639922" }}>
            {tasks.filter(t => t.done).length}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>sur {tasks.length} tâches</div>
        </div>

        {/* Tâches en retard */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px 18px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>En retard</div>
          <div style={{ fontSize: "24px", fontWeight: "600", color: enRetard > 0 ? "#e74c3c" : "#639922" }}>
            {enRetard}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>tâche{enRetard > 1 ? "s" : ""} en retard</div>
        </div>

        {/* Projets actifs */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "16px 18px" }}>
          <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>Projets actifs</div>
          <div style={{ fontSize: "24px", fontWeight: "600", color: "#BA7517" }}>
            {projects.filter(p => p.status === "En cours").length}
          </div>
          <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>sur {projects.length} projets</div>
        </div>

      </div>

      {/* ---- GRAPHIQUES CAMEMBERT ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px", minWidth: 0 }}>

        {/* Camembert priorités */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.25rem", minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}>Répartition par priorité</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dataPriorite} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {dataPriorite.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Légende */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
            {dataPriorite.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#666" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Camembert statut */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.25rem", minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}>Statut des tâches</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dataStatut} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {dataStatut.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Légende */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
            {dataStatut.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#666" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ---- GRAPHIQUE BARRES ---- */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "1.25rem", minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}>Tâches par projet</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dataTachesParProjet} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9f9f9" }} />
            {/* Barres total */}
            <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]} fill="#eee" />
            {/* Barres terminées par dessus */}
            <Bar dataKey="terminees" name="Terminées" radius={[4, 4, 0, 0]}>
              {dataTachesParProjet.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: "12px", color: "#aaa", textAlign: "center", marginTop: "8px" }}>
          Barres grises = total · Barres colorées = terminées
        </div>
      </div>

    </div>
  )
}

export default PageStats