// =====================================================
// PageSprint.jsx — Gestion des Sprints et Backlog
// Permet de créer des sprints, démarrer, clôturer
// et assigner des tâches depuis le backlog
// =====================================================
import { useState, useEffect } from "react";
import {
  getSprints,
  getBacklog,
  creerSprint,
  modifierSprint,
  assignerTacheASprint,
  retirerTacheDeSprint,
  supprimerSprint,
} from "../api";

// =====================
// COULEURS STATUT SPRINT
// =====================
function styleBadgeStatut(statut) {
  switch (statut) {
    case "active":
      return { bg: "#DCFCE7", color: "#16A34A" };
    case "closed":
      return { bg: "#F3F4F6", color: "#6B7280" };
    default:
      return { bg: "#DBEAFE", color: "#1D4ED8" };
  }
}

function labelStatut(statut) {
  switch (statut) {
    case "active":
      return "🟢 Actif";
    case "closed":
      return "✅ Clôturé";
    default:
      return "⏳ Planifié";
  }
}

// =====================
// COMPOSANT PRINCIPAL
// =====================
function PageSprint({ projects }) {
  // Projet sélectionné
  const [projectId, setProjectId] = useState("");

  // Sprints du projet
  const [sprints, setSprints] = useState([]);

  // Tâches du backlog
  const [backlog, setBacklog] = useState([]);

  // Chargement
  const [loading, setLoading] = useState(false);

  // Formulaire nouveau sprint
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [nomSprint, setNomSprint] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  // Message feedback
  const [message, setMessage] = useState("");

  // =====================
  // CHARGEMENT DES DONNÉES
  // =====================
  useEffect(() => {
    if (!projectId) {
      setSprints([]);
      setBacklog([]);
      return;
    }
    chargerDonnees();
  }, [projectId]);

  async function chargerDonnees() {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([getSprints(projectId), getBacklog(projectId)]);
      setSprints(Array.isArray(s) ? s : []);
      setBacklog(Array.isArray(b) ? b : (b?.tasks ?? []));
    } catch {
      setSprints([]);
      setBacklog([]);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // CRÉER UN SPRINT
  // =====================
  async function handleCreerSprint() {
    if (!nomSprint.trim()) return;
    setAjoutEnCours(true);
    try {
      await creerSprint({
        name: nomSprint.trim(),
        projectId: parseInt(projectId),
        startDate: dateDebut || null,
        endDate: dateFin || null,
      });
      setNomSprint("");
      setDateDebut("");
      setDateFin("");
      setAfficherFormulaire(false);
      afficherMessage("✅ Sprint créé !");
      chargerDonnees();
    } catch {
      afficherMessage("❌ Erreur création sprint");
    } finally {
      setAjoutEnCours(false);
    }
  }

  // =====================
  // DÉMARRER UN SPRINT
  // =====================
  async function handleDemarrer(sprintId) {
    try {
      await modifierSprint(sprintId, { status: "active" });
      afficherMessage("🟢 Sprint démarré !");
      chargerDonnees();
    } catch {
      afficherMessage("❌ Erreur");
    }
  }

  // =====================
  // CLÔTURER UN SPRINT
  // =====================
  async function handleCloturer(sprintId) {
    if (!window.confirm("Clôturer ce sprint ?")) return;
    try {
      await modifierSprint(sprintId, { status: "closed" });
      afficherMessage("✅ Sprint clôturé !");
      chargerDonnees();
    } catch {
      afficherMessage("❌ Erreur");
    }
  }

  // =====================
  // SUPPRIMER UN SPRINT
  // =====================
  async function handleSupprimer(sprintId) {
    if (!window.confirm("Supprimer ce sprint ?")) return;
    try {
      await supprimerSprint(sprintId);
      afficherMessage("🗑 Sprint supprimé !");
      chargerDonnees();
    } catch {
      afficherMessage("❌ Erreur");
    }
  }

  // =====================
  // ASSIGNER TÂCHE AU SPRINT
  // =====================
  async function handleAssigner(sprintId, taskId) {
    try {
      await assignerTacheASprint(sprintId, taskId);
      chargerDonnees();
    } catch {
      afficherMessage("❌ Erreur assignation");
    }
  }

  // =====================
  // RETIRER TÂCHE DU SPRINT
  // =====================
  async function handleRetirer(sprintId, taskId) {
    try {
      await retirerTacheDeSprint(sprintId, taskId);
      chargerDonnees();
    } catch {
      afficherMessage("❌ Erreur");
    }
  }

  function afficherMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ---- EN-TÊTE ---- */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>🏃 Sprints & Backlog</h2>
          <p style={{ fontSize: "13px", color: "#aaa", margin: "4px 0 0" }}>
            Planifiez et gérez vos itérations
          </p>
        </div>
        {projectId && (
          <button
            data-cy="btn-nouveau-sprint"
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            style={{
              fontSize: "13px",
              padding: "8px 16px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {afficherFormulaire ? "Annuler" : "+ Nouveau sprint"}
          </button>
        )}
      </div>

      {/* ---- MESSAGE FEEDBACK ---- */}
      {message && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            background: message.startsWith("❌") ? "#FCEBEB" : "#EAF3DE",
            color: message.startsWith("❌") ? "#A32D2D" : "#3B6D11",
          }}
        >
          {message}
        </div>
      )}

      {/* ---- SÉLECTEUR DE PROJET ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
        }}
      >
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
          Sélectionner un projet
        </div>
        <select
          data-cy="select-projet"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={{
            width: "100%",
            fontSize: "13px",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
            outline: "none",
          }}
        >
          <option value="">— Choisir un projet —</option>
          {Array.isArray(projects) &&
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </div>

      {/* ---- FORMULAIRE NOUVEAU SPRINT ---- */}
      {afficherFormulaire && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500" }}>Nouveau sprint</div>
          <input
            data-cy="input-nom-sprint"
            value={nomSprint}
            onChange={(e) => setNomSprint(e.target.value)}
            placeholder="Nom du sprint (ex: Sprint 1)"
            style={{
              fontSize: "13px",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>Date début</div>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: "13px",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>Date fin</div>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: "13px",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <button
            data-cy="btn-creer-sprint"
            onClick={handleCreerSprint}
            disabled={ajoutEnCours || !nomSprint.trim()}
            style={{
              padding: "10px",
              background: ajoutEnCours ? "#aaa" : "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: ajoutEnCours ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "500",
              alignSelf: "flex-start",
            }}
          >
            {ajoutEnCours ? "Création..." : "Créer le sprint"}
          </button>
        </div>
      )}

      {/* ---- CHARGEMENT ---- */}
      {loading && (
        <div style={{ textAlign: "center", color: "#aaa", fontSize: "13px", padding: "2rem" }}>
          Chargement...
        </div>
      )}

      {/* ---- SPRINTS ---- */}
      {!loading && projectId && sprints.length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            color: "#aaa",
            fontSize: "13px",
          }}
        >
          Aucun sprint pour ce projet. Créez votre premier sprint !
        </div>
      )}

      {!loading &&
        sprints.map((sprint) => {
          const badge = styleBadgeStatut(sprint.status);
          return (
            <div
              key={sprint.id}
              data-cy="sprint-card"
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "1.25rem",
              }}
            >
              {/* En-tête sprint */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#111" }}>
                    {sprint.name}
                  </div>
                  {(sprint.startDate || sprint.endDate) && (
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                      {sprint.startDate &&
                        `Du ${new Date(sprint.startDate).toLocaleDateString("fr-FR")}`}
                      {sprint.endDate &&
                        ` au ${new Date(sprint.endDate).toLocaleDateString("fr-FR")}`}
                    </div>
                  )}
                </div>
                {/* Badge statut */}
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: badge.bg,
                    color: badge.color,
                    fontWeight: "600",
                  }}
                >
                  {labelStatut(sprint.status)}
                </span>
                {/* Boutons action */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {sprint.status === "planned" && (
                    <button
                      data-cy="btn-demarrer-sprint"
                      onClick={() => handleDemarrer(sprint.id)}
                      style={{
                        fontSize: "12px",
                        padding: "5px 12px",
                        background: "#16A34A",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ▶ Démarrer
                    </button>
                  )}
                  {sprint.status === "active" && (
                    <button
                      data-cy="btn-cloturer-sprint"
                      onClick={() => handleCloturer(sprint.id)}
                      style={{
                        fontSize: "12px",
                        padding: "5px 12px",
                        background: "#6B7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ⏹ Clôturer
                    </button>
                  )}
                  <button
                    data-cy="btn-supprimer-sprint"
                    onClick={() => handleSupprimer(sprint.id)}
                    style={{
                      fontSize: "12px",
                      padding: "5px 12px",
                      background: "#FEE2E2",
                      color: "#DC2626",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Tâches du sprint */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {!sprint.tasks || sprint.tasks.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#ccc", fontStyle: "italic" }}>
                    Aucune tâche dans ce sprint
                  </div>
                ) : (
                  sprint.tasks.map((tache) => (
                    <div
                      key={tache.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        background: "#f9f9f9",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: tache.done
                            ? "#16A34A"
                            : tache.inProgress
                              ? "#F97316"
                              : "#9CA3AF",
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          color: tache.done ? "#aaa" : "#111",
                          textDecoration: tache.done ? "line-through" : "none",
                        }}
                      >
                        {tache.name}
                      </span>
                      <button
                        onClick={() => handleRetirer(sprint.id, tache.id)}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          background: "none",
                          color: "#DC2626",
                          border: "1px solid #FEE2E2",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Retirer
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

      {/* ---- BACKLOG ---- */}
      {!loading && projectId && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.25rem",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "12px" }}>
            📦 Backlog — tâches non assignées ({backlog.length})
          </div>
          {backlog.length === 0 ? (
            <div
              style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "1rem 0" }}
            >
              Toutes les tâches sont dans un sprint
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {backlog.map((tache) => (
                <div
                  key={tache.id}
                  data-cy="backlog-task"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ flex: 1, color: "#111" }}>{tache.name}</span>
                  {/* Assigner à un sprint */}
                  {sprints.filter((s) => s.status !== "closed").length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAssigner(e.target.value, tache.id);
                        e.target.value = "";
                      }}
                      style={{
                        fontSize: "11px",
                        padding: "3px 6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">→ Assigner à...</option>
                      {sprints
                        .filter((s) => s.status !== "closed")
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PageSprint;
