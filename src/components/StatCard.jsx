function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "16px 18px",
      border: "1px solid #eee",
      // Transition pour le hover
      transition: "box-shadow 0.2s, transform 0.2s",
      cursor: "default",
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
      {/* Label de la carte */}
      <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px", fontWeight: "500" }}>
        {label}
      </div>

      {/* Valeur principale */}
      <div style={{ fontSize: "24px", fontWeight: "600", color: color || "#222" }}>
        {value}
      </div>

      {/* Sous-titre */}
      <div style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
        {sub}
      </div>
    </div>
  )
}

export default StatCard