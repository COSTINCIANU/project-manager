// =====================================================
// PageProjetDetail.jsx — Page détail d'un projet (Web)
// Layout 2 colonnes :
//   Gauche  : infos, stats, workload, jalons
//   Droite  : onglets (Tâches / Kanban / Wiki / Rapports)
// =====================================================
import { useState, useEffect } from "react";
import {
  getTaches,
  createTache,
  updateTache,
  deleteTache,
  getWorkload,
  getUtilisateurs,
} from "../api";

// =====================
// COULEURS PRIORITÉ
// =====================
const PRIORITY_COLORS = {
  haute: "#EF4444",
  critique: "#7C3AED",
  normale: "#3B82F6",
  basse: "#22C55E",
  faible: "#22C55E",
};

// =====================
// COULEUR NIVEAU WORKLOAD
// =====================
function couleurNiveau(niveau) {
  switch (niveau) {
    case "élevé":
      return { bg: "#FEE2E2", color: "#EF4444" };
    case "moyen":
      return { bg: "#FFEDD5", color: "#F97316" };
    default:
      return { bg: "#DCFCE7", color: "#22C55E" };
  }
}

// =====================
// COMPOSANT PRINCIPAL
// =====================
function PageProjetDetail({ project, allTasks, onBack, onDelete, onUpdateTask, users }) {
  // Onglet actif : taches / kanban / wiki / rapports
  const [onglet, setOnglet] = useState("taches");

  // Tâches de ce projet
  const taches = Array.isArray(allTasks) ? allTasks.filter((t) => t.projectId === project.id) : [];

  // Workload
  const [workload, setWorkload] = useState(null);

  // Nouvelle tâche rapide
  const [nouvelleTache, setNouvelleTache] = useState("");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  // Tâche en cours de drag (kanban)
  const [draggedTask, setDraggedTask] = useState(null);

  // Chargement workload
  useEffect(() => {
    async function chargerWorkload() {
      const data = await getWorkload(project.id);
      setWorkload(data);
    }
    chargerWorkload();
  }, [project.id, taches.length]);

  // Stats
  const tachesAFaire = taches.filter((t) => !t.done && !t.inProgress);
  const tachesEnCours = taches.filter((t) => t.inProgress && !t.done);
  const tachesTerminees = taches.filter((t) => t.done);

  // Ajout rapide d'une tâche
  async function handleAjouterTache() {
    if (!nouvelleTache.trim()) return;
    setAjoutEnCours(true);
    try {
      await createTache({
        name: nouvelleTache.trim(),
        projectId: project.id,
        priority: "normale",
        done: false,
        inProgress: false,
      });
      setNouvelleTache("");
      // Recharge les tâches via le parent
      if (onUpdateTask) onUpdateTask();
    } finally {
      setAjoutEnCours(false);
    }
  }

  // Suppression tâche
  async function handleSupprimerTache(id) {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await deleteTache(id);
    if (onUpdateTask) onUpdateTask();
  }

  // Toggle statut tâche
  async function handleToggleTache(tache) {
    await updateTache(tache.id, { ...tache, done: !tache.done, inProgress: false });
    if (onUpdateTask) onUpdateTask();
  }

  // Kanban — dépose d'une tâche dans une colonne
  async function handleDrop(e, statut) {
    e.preventDefault();
    if (!draggedTask) return;
    const updated = {
      ...draggedTask,
      done: statut === "done",
      inProgress: statut === "in_progress",
    };
    await updateTache(draggedTask.id, updated);
    setDraggedTask(null);
    if (onUpdateTask) onUpdateTask();
  }

  // Style onglet
  function styleOnglet(nom) {
    const actif = onglet === nom;
    return {
      padding: "8px 18px",
      fontSize: "13px",
      fontWeight: actif ? "600" : "400",
      color: actif ? "#111" : "#888",
      borderBottom: actif ? "2px solid #111" : "2px solid transparent",
      cursor: "pointer",
      background: "none",
      border: "none",
      borderBottom: actif ? "2px solid #111" : "2px solid transparent",
    };
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ---- EN-TÊTE ---- */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            color: "#888",
            padding: "4px 8px",
          }}
        >
          ← Retour
        </button>
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: project.color,
            flexShrink: 0,
          }}
        />
        <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0, flex: 1 }}>{project.name}</h2>
        {/* Badge statut */}
        <span
          style={{
            fontSize: "12px",
            padding: "4px 12px",
            borderRadius: "20px",
            fontWeight: "500",
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
        </span>
        {/* Bouton supprimer projet */}
        <button
          onClick={() => {
            if (window.confirm("Supprimer ce projet ?")) onDelete(project.id);
          }}
          style={{
            fontSize: "12px",
            padding: "4px 12px",
            background: "#fff0f0",
            color: "#c0392b",
            border: "1px solid #fdd",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🗑 Supprimer
        </button>
      </div>

      {/* ---- BARRE DE PROGRESSION ---- */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            flex: 1,
            height: "8px",
            background: "#eee",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${project.progress}%`,
              background: project.color,
              borderRadius: "4px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span style={{ fontSize: "13px", color: "#888", minWidth: "40px" }}>
          {project.progress}%
        </span>
      </div>

      {/* ---- LAYOUT 2 COLONNES ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* ======== COLONNE GAUCHE ======== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Stats */}
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
                fontSize: "13px",
                fontWeight: "600",
                color: "#888",
                marginBottom: "14px",
                textTransform: "uppercase",
              }}
            >
              Statistiques
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {[
                { label: "À faire", value: tachesAFaire.length, color: "#888" },
                { label: "En cours", value: tachesEnCours.length, color: "#F97316" },
                { label: "Terminées", value: tachesTerminees.length, color: "#22C55E" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    textAlign: "center",
                    padding: "12px 8px",
                    background: "#f9f9f9",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ fontSize: "22px", fontWeight: "700", color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jauge de charge membres */}
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
                fontSize: "13px",
                fontWeight: "600",
                color: "#888",
                marginBottom: "14px",
                textTransform: "uppercase",
              }}
            >
              ⚡ Charge membres
            </div>
            {!workload || workload.membres.length === 0 ? (
              <div
                style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "8px 0" }}
              >
                Aucune tâche assignée
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {workload.membres.map((membre) => {
                  const { bg, color } = couleurNiveau(membre.niveau);
                  const pct =
                    membre.tachesTotal > 0
                      ? Math.round((membre.tachesRestantes / membre.tachesTotal) * 100)
                      : 0;
                  return (
                    <div key={membre.userId}>
                      {/* Nom + badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "12px",
                              color,
                            }}
                          >
                            {membre.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "500", color: "#111" }}>
                              {membre.nom}
                            </div>
                            <div style={{ fontSize: "10px", color: "#aaa" }}>
                              {membre.role ?? "membre"}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            background: bg,
                            color,
                            fontWeight: "600",
                          }}
                        >
                          {membre.niveau}
                        </span>
                      </div>
                      {/* Barre */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            flex: 1,
                            height: "6px",
                            background: "#f0f0f0",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "6px",
                              background: color,
                              borderRadius: "3px",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <span
                          style={{ fontSize: "11px", color, fontWeight: "600", minWidth: "30px" }}
                        >
                          {pct}%
                        </span>
                      </div>
                      {/* Stats mini */}
                      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#aaa" }}>
                          <span style={{ color, fontWeight: "600" }}>{membre.tachesRestantes}</span>{" "}
                          restantes
                        </span>
                        <span style={{ fontSize: "10px", color: "#aaa" }}>
                          <span style={{ color: "#22C55E", fontWeight: "600" }}>
                            {membre.tachesTerminees}
                          </span>{" "}
                          terminées
                        </span>
                        <span style={{ fontSize: "10px", color: "#aaa" }}>
                          <span style={{ color: "#555", fontWeight: "600" }}>
                            {membre.tachesTotal}
                          </span>{" "}
                          total
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Membres assignés */}
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
                fontSize: "13px",
                fontWeight: "600",
                color: "#888",
                marginBottom: "14px",
                textTransform: "uppercase",
              }}
            >
              👥 Membres
            </div>
            {!workload || workload.membres.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#aaa" }}>Aucun membre assigné</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {workload.membres.map((m) => (
                  <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "13px",
                        color: "#555",
                      }}
                    >
                      {m.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "500" }}>{m.nom}</div>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ======== COLONNE DROITE — ONGLETS ======== */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Barre d'onglets */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #eee",
              padding: "0 16px",
              gap: "4px",
            }}
          >
            {[
              { id: "taches", label: "📋 Tâches" },
              { id: "kanban", label: "🗂 Kanban" },
              { id: "wiki", label: "📚 Wiki" },
              { id: "rapports", label: "📈 Rapports" },
            ].map((o) => (
              <button key={o.id} onClick={() => setOnglet(o.id)} style={styleOnglet(o.id)}>
                {o.label}
              </button>
            ))}
          </div>

          {/* ---- ONGLET TÂCHES ---- */}
          {onglet === "taches" && (
            <div style={{ padding: "1.25rem" }}>
              {/* Ajout rapide */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input
                  value={nouvelleTache}
                  onChange={(e) => setNouvelleTache(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAjouterTache()}
                  placeholder="Ajouter une tâche..."
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleAjouterTache}
                  disabled={ajoutEnCours || !nouvelleTache.trim()}
                  style={{
                    padding: "8px 16px",
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    opacity: ajoutEnCours ? 0.5 : 1,
                  }}
                >
                  + Ajouter
                </button>
              </div>

              {/* Liste tâches */}
              {taches.length === 0 ? (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#aaa",
                    textAlign: "center",
                    padding: "2rem 0",
                  }}
                >
                  Aucune tâche dans ce projet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {taches.map((tache) => {
                    const couleur = PRIORITY_COLORS[tache.priority] ?? "#888";
                    return (
                      <div
                        key={tache.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #f0f0f0",
                          background: tache.done ? "#fafafa" : "#fff",
                        }}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={tache.done}
                          onChange={() => handleToggleTache(tache)}
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                        {/* Barre couleur priorité */}
                        <div
                          style={{
                            width: "3px",
                            height: "32px",
                            borderRadius: "2px",
                            background: couleur,
                            flexShrink: 0,
                          }}
                        />
                        {/* Assignation — sélecteur inline */}
                        <select
                          value={tache.assignedTo ?? ""}
                          onChange={async (e) => {
                            const val = e.target.value;
                            await updateTache(tache.id, {
                              ...tache,
                              assignedTo: val ? parseInt(val) : null,
                            });
                            if (onUpdateTask) onUpdateTask();
                          }}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            background: "#fff",
                            color: "#555",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <option value="">👤 Non assigné</option>
                          {Array.isArray(users) &&
                            users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name ?? u.email}
                              </option>
                            ))}
                        </select>
                        {/* Badge statut */}
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            flexShrink: 0,
                            background: tache.done
                              ? "#EAF3DE"
                              : tache.inProgress
                                ? "#FFF3E0"
                                : "#f0f0f0",
                            color: tache.done ? "#3B6D11" : tache.inProgress ? "#E65100" : "#888",
                          }}
                        >
                          {tache.done
                            ? "✅ Terminé"
                            : tache.inProgress
                              ? "🔄 En cours"
                              : "⏳ À faire"}
                        </span>
                        {/* Supprimer */}
                        <button
                          onClick={() => handleSupprimerTache(tache.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ddd",
                            fontSize: "16px",
                            flexShrink: 0,
                            padding: "2px 6px",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#c0392b")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---- ONGLET KANBAN ---- */}
          {onglet === "kanban" && (
            <div style={{ padding: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                {[
                  { id: "todo", label: "⏳ À faire", taches: tachesAFaire, bg: "#f9f9f9" },
                  { id: "in_progress", label: "🔄 En cours", taches: tachesEnCours, bg: "#FFF8F0" },
                  { id: "done", label: "✅ Terminé", taches: tachesTerminees, bg: "#F0FFF4" },
                ].map((col) => (
                  <div
                    key={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, col.id)}
                    style={{
                      background: col.bg,
                      borderRadius: "10px",
                      padding: "12px",
                      minHeight: "200px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#555",
                        marginBottom: "10px",
                      }}
                    >
                      {col.label} ({col.taches.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {col.taches.map((t) => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={() => setDraggedTask(t)}
                          onDragEnd={() => setDraggedTask(null)}
                          style={{
                            background: "#fff",
                            borderRadius: "8px",
                            padding: "10px",
                            fontSize: "12px",
                            border: "1px solid #eee",
                            cursor: "grab",
                            boxShadow:
                              draggedTask?.id === t.id ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                          }}
                        >
                          <div style={{ fontWeight: "500", color: "#111", marginBottom: "4px" }}>
                            {t.name}
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              color: PRIORITY_COLORS[t.priority] ?? "#888",
                              fontWeight: "600",
                            }}
                          >
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- ONGLET WIKI ---- */}
          {onglet === "wiki" && (
            <div style={{ padding: "1.25rem" }}>
              <PageWikiInline projectId={project.id} />
            </div>
          )}

          {/* ---- ONGLET RAPPORTS ---- */}
          {onglet === "rapports" && (
            <div style={{ padding: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[
                  { label: "Total tâches", value: taches.length, color: "#3B82F6" },
                  { label: "Terminées", value: tachesTerminees.length, color: "#22C55E" },
                  { label: "En cours", value: tachesEnCours.length, color: "#F97316" },
                  { label: "À faire", value: tachesAFaire.length, color: "#888" },
                  {
                    label: "Taux complétion",
                    value:
                      taches.length > 0
                        ? `${Math.round((tachesTerminees.length / taches.length) * 100)}%`
                        : "0%",
                    color: "#7C3AED",
                  },
                  {
                    label: "Priorité haute",
                    value: taches.filter((t) => t.priority === "haute" || t.priority === "critique")
                      .length,
                    color: "#EF4444",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "#f9f9f9",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "28px", fontWeight: "700", color: stat.color }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================
// SOUS-COMPOSANT WIKI INLINE
// Charge et affiche le wiki du projet
// =====================
function PageWikiInline({ projectId }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [ajout, setAjout] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

  function getToken() {
    return localStorage.getItem("jwt_token");
  }

  useEffect(() => {
    chargerWiki();
  }, [projectId]);

  async function chargerWiki() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wiki/project/${projectId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function ajouterArticle() {
    if (!titre.trim()) return;
    try {
      await fetch(`${API_URL}/wiki`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title: titre, content: contenu, projectId }),
      });
      setTitre("");
      setContenu("");
      setAjout(false);
      chargerWiki();
    } catch {}
  }

  async function supprimerArticle(id) {
    if (!window.confirm("Supprimer cet article ?")) return;
    await fetch(`${API_URL}/wiki/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    chargerWiki();
  }

  if (loading) return <div style={{ color: "#aaa", fontSize: "13px" }}>Chargement...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", fontWeight: "500" }}>📚 Wiki du projet</div>
        <button
          onClick={() => setAjout(!ajout)}
          style={{
            fontSize: "12px",
            padding: "6px 14px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {ajout ? "Annuler" : "+ Nouvel article"}
        </button>
      </div>

      {/* Formulaire ajout */}
      {ajout && (
        <div
          style={{
            background: "#f9f9f9",
            borderRadius: "10px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre de l'article..."
            style={{
              fontSize: "13px",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
            }}
          />
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Contenu..."
            rows={4}
            style={{
              fontSize: "13px",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              resize: "vertical",
            }}
          />
          <button
            onClick={ajouterArticle}
            style={{
              padding: "8px 16px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              alignSelf: "flex-start",
            }}
          >
            Publier
          </button>
        </div>
      )}

      {/* Liste articles */}
      {articles.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "2rem 0" }}>
          Aucun article dans ce wiki
        </div>
      ) : (
        articles.map((a) => (
          <div
            key={a.id}
            style={{ border: "1px solid #eee", borderRadius: "10px", padding: "14px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{a.title}</div>
              <button
                onClick={() => supprimerArticle(a.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#ddd",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c0392b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
              >
                ✕
              </button>
            </div>
            <div
              style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", whiteSpace: "pre-wrap" }}
            >
              {a.content}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PageProjetDetail;
