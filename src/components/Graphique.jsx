// Importation des composants Recharts nécessaires pour le graphique
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

function Graphique({ projects }) {

  // =====================
  // PRÉPARATION DES DONNÉES
  // =====================

  // On formate les données pour Recharts
  // Chaque projet devient un objet avec un nom court et sa progression
  const data = projects.map(p => ({
    // On coupe le nom à 10 caractères pour ne pas surcharger l'axe X
    name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
    progression: p.progress,
    couleur: p.color,
  }))

  // =====================
  // COMPOSANT TOOLTIP PERSONNALISÉ
  // =====================

  // Affiche les détails au survol d'une barre
  function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "13px",
        }}>
          <div style={{ fontWeight: "500", marginBottom: "4px" }}>{label}</div>
          <div style={{ color: "#666" }}>Progression : <strong>{payload[0].value}%</strong></div>
        </div>
      )
    }
    return null
  }

  // =====================
  // RENDU DU GRAPHIQUE
  // =====================

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: "12px",
      padding: "1.25rem",
      marginTop: "14px",
    }}>

      {/* Titre du graphique */}
      <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1.5rem" }}>
        Progression des projets
      </div>

      {/* Graphique en barres — ResponsiveContainer s'adapte à la largeur */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={36}>

          {/* Grille de fond discrète */}
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

          {/* Axe horizontal — noms des projets */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />

          {/* Axe vertical — pourcentage de 0 à 100 */}
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#999" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
          />

          {/* Tooltip au survol */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9f9f9" }} />

          {/* Barres colorées selon la couleur de chaque projet */}
          <Bar
            dataKey="progression"
            radius={[6, 6, 0, 0]}
            label={{ position: "top", fontSize: 11, fill: "#aaa", formatter: v => `${v}%` }}
          >
            {/* On colorie chaque barre individuellement avec la couleur du projet */}
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.couleur} />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Graphique