// =====================================================
// PageRapportsAvances.jsx — Rapports avancés
// Affiche : vélocité par sprint, temps passé par membre,
// comparatif multi-sprints et export CSV
// Utilise Recharts pour les graphiques
// =====================================================
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// =====================
// FONCTION UTILITAIRE — Appel API avec token
// =====================
async function appelAPI(endpoint) {
  const reponse = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
    },
  });
  return reponse.json();
}

function PageRapportsAvances({ projects = [] }) {
  // =====================
  // ÉTATS
  // =====================

  // Projet sélectionné
  const [projetId, setProjetId] = useState(projects.length > 0 ? projects[0].id : null);

  // Onglet actif — velocite | temps | multi | export
  const [ongletActif, setOngletActif] = useState("velocite");

  // Données de vélocité
  const [donneesVelocite, setDonneesVelocite] = useState(null);

  // Données temps passé
  const [donneesTemps, setDonneesTemps] = useState(null);

  // Données multi-sprint
  const [donneesMulti, setDonneesMulti] = useState(null);

  // Chargement en cours
  const [chargement, setChargement] = useState(false);

  // Message d'erreur
  const [erreur, setErreur] = useState(null);

  // =====================
  // CHARGEMENT DES DONNÉES
  // Se déclenche quand le projet ou l'onglet change
  // =====================
  useEffect(() => {
    if (!projetId) return;
    chargerDonnees();
  }, [projetId, ongletActif]);

  async function chargerDonnees() {
    setChargement(true);
    setErreur(null);

    try {
      if (ongletActif === "velocite" && !donneesVelocite) {
        const données = await appelAPI(`/reports/project/${projetId}/velocity`);
        setDonneesVelocite(données);
      }
      if (ongletActif === "temps" && !donneesTemps) {
        const données = await appelAPI(`/reports/project/${projetId}/time-spent`);
        setDonneesTemps(données);
      }
      if (ongletActif === "multi" && !donneesMulti) {
        const données = await appelAPI(`/reports/project/${projetId}/multi-sprint`);
        setDonneesMulti(données);
      }
    } catch (err) {
      setErreur("Erreur lors du chargement des données.");
      console.error("Erreur rapports :", err);
    } finally {
      setChargement(false);
    }
  }

  // Recharge quand le projet change
  function changerProjet(id) {
    setProjetId(parseInt(id));
    setDonneesVelocite(null);
    setDonneesTemps(null);
    setDonneesMulti(null);
  }

  // =====================
  // EXPORT CSV
  // Télécharge le fichier CSV directement
  // =====================
  async function telechargerCsv() {
    const reponse = await fetch(`${API_URL}/reports/project/${projetId}/export-csv`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
      },
    });
    const blob = await reponse.blob();
    const url = window.URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `rapport_projet_${projetId}_${new Date().toISOString().split("T")[0]}.csv`;
    lien.click();
    window.URL.revokeObjectURL(url);
  }

  // =====================
  // STYLES
  // =====================
  const styleOnglet = (actif) => ({
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: actif ? "600" : "400",
    background: actif ? "#111" : "#fff",
    color: actif ? "#fff" : "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
  });

  const styleSelect = {
    fontSize: "13px",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    outline: "none",
    minWidth: "200px",
  };

  const styleCarte = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "1rem",
  };

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ maxWidth: "900px" }}>
      {/* ---- EN-TÊTE — sélecteur de projet ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <select
          value={projetId || ""}
          onChange={(e) => changerProjet(e.target.value)}
          style={styleSelect}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Bouton export CSV toujours visible */}
        <button
          onClick={telechargerCsv}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            background: "#639922",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* ---- ONGLETS ---- */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setOngletActif("velocite")}
          style={styleOnglet(ongletActif === "velocite")}
        >
          📈 Vélocité
        </button>
        <button
          onClick={() => setOngletActif("temps")}
          style={styleOnglet(ongletActif === "temps")}
        >
          ⏱️ Temps passé
        </button>
        <button
          onClick={() => setOngletActif("multi")}
          style={styleOnglet(ongletActif === "multi")}
        >
          📊 Multi-sprints
        </button>
      </div>

      {/* ---- MESSAGE ERREUR ---- */}
      {erreur && (
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            background: "#FCEBEB",
            color: "#A32D2D",
            marginBottom: "1rem",
            fontSize: "13px",
          }}
        >
          {erreur}
        </div>
      )}

      {/* ---- CHARGEMENT ---- */}
      {chargement && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            fontSize: "13px",
            color: "#aaa",
          }}
        >
          Chargement des données...
        </div>
      )}

      {/* ════════════════════════════════════════
          ONGLET 1 — VÉLOCITÉ PAR SPRINT
      ════════════════════════════════════════ */}
      {ongletActif === "velocite" && donneesVelocite && !chargement && (
        <div>
          {/* Carte résumé */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "1rem",
            }}
          >
            <div style={{ ...styleCarte, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#378ADD",
                }}
              >
                {donneesVelocite.velociteMoyenne}
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                Vélocité moyenne
              </div>
            </div>
            <div style={{ ...styleCarte, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#639922",
                }}
              >
                {donneesVelocite.totalSprints}
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Total sprints</div>
            </div>
            <div style={{ ...styleCarte, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#D85A30",
                }}
              >
                {donneesVelocite.sprints.reduce((acc, s) => acc + s.tachesTerminees, 0)}
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                Total tâches terminées
              </div>
            </div>
          </div>

          {/* Graphique vélocité */}
          <div style={styleCarte}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              Vélocité par sprint — tâches terminées
            </div>
            {donneesVelocite.sprints.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  padding: "2rem",
                  fontSize: "13px",
                }}
              >
                Aucun sprint pour ce projet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={donneesVelocite.sprints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="sprintNom" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      name === "velocite" ? "Tâches terminées" : "Total tâches",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalTaches"
                    name="Total tâches"
                    fill="#E6F1FB"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="tachesTerminees"
                    name="Tâches terminées"
                    fill="#378ADD"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tableau détail sprints */}
          <div style={styleCarte}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              Détail par sprint
            </div>
            {donneesVelocite.sprints.map((sprint) => (
              <div
                key={sprint.sprintId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #f5f5f5",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>{sprint.sprintNom}</div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>
                    {sprint.dateDebut} → {sprint.dateFin}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#378ADD",
                      }}
                    >
                      {sprint.tachesTerminees}
                    </div>
                    <div style={{ fontSize: "10px", color: "#aaa" }}>terminées</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#639922",
                      }}
                    >
                      {sprint.tauxCompletion}%
                    </div>
                    <div style={{ fontSize: "10px", color: "#aaa" }}>complétion</div>
                  </div>
                  {/* Badge statut */}
                  <div
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "20px",
                      background: sprint.statut === "completed" ? "#EAF3DE" : "#E6F1FB",
                      color: sprint.statut === "completed" ? "#3B6D11" : "#185FA5",
                    }}
                  >
                    {sprint.statut}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          ONGLET 2 — TEMPS PASSÉ PAR MEMBRE
      ════════════════════════════════════════ */}
      {ongletActif === "temps" && donneesTemps && !chargement && (
        <div>
          {/* Carte résumé total heures */}
          <div style={{ ...styleCarte, textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#378ADD" }}>
              {donneesTemps.totalHeures}h
            </div>
            <div style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
              Temps total estimé sur {donneesTemps.parTache.length} tâches
            </div>
          </div>

          {/* Graphique temps par tâche — top 10 */}
          <div style={styleCarte}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              Top tâches par temps estimé
            </div>
            {donneesTemps.parTache.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  padding: "2rem",
                  fontSize: "13px",
                }}
              >
                Aucune tâche avec temps estimé
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={donneesTemps.parTache.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
                  <YAxis type="category" dataKey="tacheNom" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v) => [`${v}h`, "Temps estimé"]} />
                  <Bar
                    dataKey="heuresEstimees"
                    name="Heures"
                    fill="#378ADD"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Liste des tâches avec temps */}
          <div style={styleCarte}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              Toutes les tâches
            </div>
            {donneesTemps.parTache.map((tache) => (
              <div
                key={tache.tacheId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f5f5f5",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>{tache.tacheNom}</div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>
                    {tache.priorite} · {tache.statut}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#378ADD",
                  }}
                >
                  {tache.heuresEstimees}h
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          ONGLET 3 — COMPARATIF MULTI-SPRINTS
      ════════════════════════════════════════ */}
      {ongletActif === "multi" && donneesMulti && !chargement && (
        <div>
          {/* Graphique comparatif — tâches par sprint */}
          <div style={styleCarte}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              Comparatif des sprints — tâches par statut
            </div>
            {donneesMulti.sprints.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  padding: "2rem",
                  fontSize: "13px",
                }}
              >
                Aucun sprint pour ce projet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={donneesMulti.sprints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="sprintNom" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="tachesTerminees"
                    name="Terminées"
                    fill="#639922"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="tachesEnCours"
                    name="En cours"
                    fill="#378ADD"
                    radius={[0, 0, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="tachesAFaire"
                    name="À faire"
                    fill="#E0E0E0"
                    radius={[0, 0, 4, 4]}
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Graphique taux de complétion — ligne */}
          <div style={styleCarte}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              Évolution du taux de complétion
            </div>
            {donneesMulti.sprints.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  padding: "2rem",
                  fontSize: "13px",
                }}
              >
                Aucun sprint disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={donneesMulti.sprints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="sprintNom" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}%`, "Complétion"]} />
                  <Line
                    type="monotone"
                    dataKey="tauxCompletion"
                    name="Taux de complétion"
                    stroke="#378ADD"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tableau comparatif */}
          <div style={styleCarte}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "1rem",
              }}
            >
              Tableau comparatif
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      borderBottom: "2px solid #eee",
                    }}
                  >
                    Sprint
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      borderBottom: "2px solid #eee",
                    }}
                  >
                    Total
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      borderBottom: "2px solid #eee",
                      color: "#639922",
                    }}
                  >
                    ✅ Terminées
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      borderBottom: "2px solid #eee",
                      color: "#378ADD",
                    }}
                  >
                    🔵 En cours
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      borderBottom: "2px solid #eee",
                      color: "#aaa",
                    }}
                  >
                    ⬜ À faire
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      borderBottom: "2px solid #eee",
                    }}
                  >
                    Complétion
                  </th>
                </tr>
              </thead>
              <tbody>
                {donneesMulti.sprints.map((sprint) => (
                  <tr key={sprint.sprintId} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "8px", fontWeight: "500" }}>{sprint.sprintNom}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>{sprint.totalTaches}</td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "#639922",
                        fontWeight: "600",
                      }}
                    >
                      {sprint.tachesTerminees}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "#378ADD",
                        fontWeight: "600",
                      }}
                    >
                      {sprint.tachesEnCours}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "#aaa",
                        fontWeight: "600",
                      }}
                    >
                      {sprint.tachesAFaire}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "20px",
                          background:
                            sprint.tauxCompletion >= 75
                              ? "#EAF3DE"
                              : sprint.tauxCompletion >= 50
                                ? "#E6F1FB"
                                : "#fff0f0",
                          color:
                            sprint.tauxCompletion >= 75
                              ? "#3B6D11"
                              : sprint.tauxCompletion >= 50
                                ? "#185FA5"
                                : "#A32D2D",
                          fontWeight: "600",
                        }}
                      >
                        {sprint.tauxCompletion}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- AUCUNE DONNÉE ---- */}
      {!chargement &&
        !erreur &&
        ((ongletActif === "velocite" && !donneesVelocite) ||
          (ongletActif === "temps" && !donneesTemps) ||
          (ongletActif === "multi" && !donneesMulti)) && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "#aaa",
              fontSize: "13px",
            }}
          >
            Sélectionne un projet pour afficher les rapports
          </div>
        )}
    </div>
  );
}

export default PageRapportsAvances;
