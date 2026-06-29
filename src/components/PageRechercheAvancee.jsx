// =====================================================
// PageRechercheAvancee.jsx — Recherche avancée
// Permet de filtrer les tâches et projets avec
// des critères combinés : terme, priorité, statut,
// projet, date de début et date de fin
// =====================================================
import { useState } from "react";

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// =====================
// OPTIONS DES FILTRES
// =====================

// Options de priorité
const OPTIONS_PRIORITE = [
  { valeur: "", label: "Toutes les priorités" },
  { valeur: "critique", label: "🔴 Critique" },
  { valeur: "haute", label: "🟠 Haute" },
  { valeur: "normale", label: "🟡 Normale" },
  { valeur: "basse", label: "🟢 Basse" },
];

// Options de statut
const OPTIONS_STATUT = [
  { valeur: "", label: "Tous les statuts" },
  { valeur: "todo", label: "⬜ À faire" },
  { valeur: "in_progress", label: "🔵 En cours" },
  { valeur: "done", label: "✅ Terminé" },
];

// Options de type de ticket
const OPTIONS_TYPE = [
  { valeur: "", label: "Tous les types" },
  { valeur: "task", label: "✅ Tâche" },
  { valeur: "bug", label: "🐛 Bug" },
  { valeur: "story", label: "📖 Story" },
  { valeur: "epic", label: "⚡ Epic" },
];

function PageRechercheAvancee({ projects = [] }) {
  // =====================
  // ÉTATS DES FILTRES
  // =====================

  // Terme de recherche libre
  const [terme, setTerme] = useState("");

  // Filtre par priorité
  const [priorite, setPriorite] = useState("");

  // Filtre par statut
  const [statut, setStatut] = useState("");

  // Filtre par type de ticket
  const [type, setType] = useState("");

  // Filtre par projet
  const [projetId, setProjetId] = useState("");

  // Filtre par date de début
  const [dateDebut, setDateDebut] = useState("");

  // Filtre par date de fin
  const [dateFin, setDateFin] = useState("");

  // =====================
  // ÉTATS DES RÉSULTATS
  // =====================

  // Résultats de la recherche
  const [resultats, setResultats] = useState(null);

  // Chargement en cours
  const [chargement, setChargement] = useState(false);

  // Message d'erreur
  const [erreur, setErreur] = useState(null);

  // =====================
  // LANCER LA RECHERCHE
  // =====================
  async function lancerRecherche() {
    setChargement(true);
    setErreur(null);

    try {
      // Construction des paramètres de l'URL
      const params = new URLSearchParams();
      if (terme) params.append("q", terme);
      if (priorite) params.append("priority", priorite);
      if (statut) params.append("status", statut);
      if (type) params.append("type", type);
      if (projetId) params.append("project_id", projetId);
      if (dateDebut) params.append("date_from", dateDebut);
      if (dateFin) params.append("date_to", dateFin);

      const reponse = await fetch(`${API_URL}/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });

      const données = await reponse.json();
      setResultats(données);
    } catch (err) {
      setErreur("Erreur lors de la recherche. Vérifiez votre connexion.");
      console.error("Erreur recherche :", err);
    } finally {
      setChargement(false);
    }
  }

  // =====================
  // RÉINITIALISER LES FILTRES
  // =====================
  function reinitialiser() {
    setTerme("");
    setPriorite("");
    setStatut("");
    setType("");
    setProjetId("");
    setDateDebut("");
    setDateFin("");
    setResultats(null);
    setErreur(null);
  }

  // =====================
  // STYLES RÉUTILISABLES
  // =====================
  const styleSelect = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    outline: "none",
    color: "#333",
  };

  const styleInput = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
  };

  const styleLabelFiltre = {
    fontSize: "11px",
    color: "#999",
    marginBottom: "4px",
    display: "block",
  };

  // Couleur du badge priorité
  function couleurPriorite(priorite) {
    switch (priorite) {
      case "critique":
        return { background: "#FCEBEB", color: "#A32D2D" };
      case "haute":
        return { background: "#FFF0E6", color: "#854F0B" };
      case "normale":
        return { background: "#FFFBE6", color: "#856A00" };
      case "basse":
        return { background: "#EAF3DE", color: "#3B6D11" };
      default:
        return { background: "#f0f0f0", color: "#888" };
    }
  }

  // Icône du type de ticket
  function iconeType(type) {
    switch (type) {
      case "bug":
        return "🐛";
      case "story":
        return "📖";
      case "epic":
        return "⚡";
      default:
        return "✅";
    }
  }

  // =====================
  // RENDU
  // =====================
  return (
    // <div style={{ maxWidth: "900px", width: "100%", alignSelf: "center" }}>
    <div style={{ width: "100%" }}>
      {/* ---- PANNEAU DE FILTRES ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "1rem",
          }}
        >
          Filtres de recherche
        </div>

        {/* Ligne 1 — Terme + Projet */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div>
            <label style={styleLabelFiltre}>Recherche libre</label>
            <input
              type="text"
              placeholder="Nom de la tâche ou du projet..."
              value={terme}
              onChange={(e) => setTerme(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lancerRecherche()}
              style={styleInput}
            />
          </div>
          <div>
            <label style={styleLabelFiltre}>Projet</label>
            <select
              value={projetId}
              onChange={(e) => setProjetId(e.target.value)}
              style={styleSelect}
            >
              <option value="">Tous les projets</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ligne 2 — Priorité + Statut + Type */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div>
            <label style={styleLabelFiltre}>Priorité</label>
            <select
              value={priorite}
              onChange={(e) => setPriorite(e.target.value)}
              style={styleSelect}
            >
              {OPTIONS_PRIORITE.map((o) => (
                <option key={o.valeur} value={o.valeur}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={styleLabelFiltre}>Statut</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value)} style={styleSelect}>
              {OPTIONS_STATUT.map((o) => (
                <option key={o.valeur} value={o.valeur}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={styleLabelFiltre}>Type de ticket</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={styleSelect}>
              {OPTIONS_TYPE.map((o) => (
                <option key={o.valeur} value={o.valeur}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ligne 3 — Date début + Date fin */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label style={styleLabelFiltre}>Date d'échéance — du</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              style={styleInput}
            />
          </div>
          <div>
            <label style={styleLabelFiltre}>Date d'échéance — au</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              style={styleInput}
            />
          </div>
        </div>

        {/* Boutons Rechercher et Réinitialiser */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={lancerRecherche}
            disabled={chargement}
            style={{
              flex: 1,
              padding: "10px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: chargement ? "wait" : "pointer",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {chargement ? "Recherche en cours..." : "🔍 Rechercher"}
          </button>
          <button
            onClick={reinitialiser}
            style={{
              padding: "10px 16px",
              background: "#f5f5f5",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* ---- MESSAGE ERREUR ---- */}
      {erreur && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "1rem",
            background: "#FCEBEB",
            color: "#A32D2D",
          }}
        >
          {erreur}
        </div>
      )}

      {/* ---- RÉSULTATS ---- */}
      {resultats && (
        <div>
          {/* Compteur de résultats */}
          <div
            style={{
              fontSize: "13px",
              color: "#999",
              marginBottom: "1rem",
            }}
          >
            {resultats.total} résultat{resultats.total > 1 ? "s" : ""} trouvé
            {resultats.total > 1 ? "s" : ""}
          </div>

          {/* ---- PROJETS ---- */}
          {resultats.projects.length > 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "0.75rem",
                  color: "#555",
                }}
              >
                Projets ({resultats.projects.length})
              </div>
              {resultats.projects.map((projet) => (
                <div
                  key={projet.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  {/* Point coloré du projet */}
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: projet.color || "#888",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{projet.name}</div>
                  </div>
                  {/* Badge statut */}
                  <div
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "20px",
                      background: projet.status === "Terminé" ? "#EAF3DE" : "#E6F1FB",
                      color: projet.status === "Terminé" ? "#3B6D11" : "#185FA5",
                    }}
                  >
                    {projet.status}
                  </div>
                  {/* Barre de progression */}
                  <div style={{ fontSize: "12px", color: "#aaa" }}>{projet.progress}%</div>
                </div>
              ))}
            </div>
          )}

          {/* ---- TÂCHES ---- */}
          {resultats.tasks.length > 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "0.75rem",
                  color: "#555",
                }}
              >
                Tâches ({resultats.tasks.length})
              </div>
              {resultats.tasks.map((tache) => (
                <div
                  key={tache.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  {/* Icône type de ticket */}
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>
                    {iconeType(tache.ticketType)}
                  </span>

                  {/* Nom de la tâche */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        textDecoration: tache.done ? "line-through" : "none",
                        color: tache.done ? "#aaa" : "#222",
                      }}
                    >
                      {tache.name}
                    </div>
                    {/* Date d'échéance si disponible */}
                    {tache.dueDate && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#bbb",
                          marginTop: "2px",
                        }}
                      >
                        📅 {new Date(tache.dueDate).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>

                  {/* Badge priorité */}
                  <div
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "20px",
                      fontWeight: "500",
                      ...couleurPriorite(tache.priority),
                    }}
                  >
                    {tache.priority}
                  </div>

                  {/* Badge statut */}
                  <div
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "20px",
                      background: tache.done ? "#EAF3DE" : tache.inProgress ? "#E6F1FB" : "#f5f5f5",
                      color: tache.done ? "#3B6D11" : tache.inProgress ? "#185FA5" : "#888",
                    }}
                  >
                    {tache.done ? "Terminé" : tache.inProgress ? "En cours" : "À faire"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- AUCUN RÉSULTAT ---- */}
          {resultats.total === 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "2rem",
                textAlign: "center",
                fontSize: "13px",
                color: "#aaa",
              }}
            >
              Aucun résultat pour ces critères de recherche.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PageRechercheAvancee;
