// =====================================================
// PageAutomatisations.jsx — Page de gestion des règles
// Permet de créer des règles "Quand X → faire Y"
// sur chaque projet
// =====================================================
import { useState, useEffect } from "react";
import { getRegles, creerRegle, toggleRegle, supprimerRegle } from "../api";

// =====================
// LISTE DES DÉCLENCHEURS DISPONIBLES
// Ce qui peut provoquer une règle
// =====================
const DECLENCHEURS = [
  { valeur: "tache_statut_change", label: "Une tâche change de statut" },
  { valeur: "tache_creee", label: "Une nouvelle tâche est créée" },
  { valeur: "tache_assignee", label: "Une tâche est assignée" },
  { valeur: "tache_en_retard", label: "Une tâche est en retard" },
];

// =====================
// LISTE DES ACTIONS DISPONIBLES
// Ce qui se passe quand la règle se déclenche
// =====================
const ACTIONS = [
  { valeur: "notifier_manager", label: "Notifier le manager" },
  { valeur: "changer_priorite", label: "Changer la priorité" },
  { valeur: "envoyer_email", label: "Envoyer un email" },
];

// =====================
// VALEURS POSSIBLES SELON LE DÉCLENCHEUR
// =====================
const VALEURS_DECLENCHEUR = {
  tache_statut_change: ["À faire", "En cours", "Terminé"],
  tache_creee: [],
  tache_assignee: [],
  tache_en_retard: [],
};

// =====================
// VALEURS POSSIBLES SELON L'ACTION
// =====================
const VALEURS_ACTION = {
  changer_priorite: ["basse", "normale", "haute", "critique"],
  notifier_manager: [],
  envoyer_email: [],
};

function PageAutomatisations({ projects = [] }) {
  // =====================
  // ÉTATS
  // =====================

  // Projet sélectionné pour voir ses règles
  const [projetSelectionne, setProjetSelectionne] = useState(
    projects.length > 0 ? projects[0].id : null,
  );

  // Liste des règles du projet sélectionné
  const [regles, setRegles] = useState([]);

  // Chargement en cours
  const [chargement, setChargement] = useState(false);

  // Afficher ou masquer le formulaire de création
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);

  // Champs du formulaire de création
  const [formulaire, setFormulaire] = useState({
    nom: "",
    declencheur: "tache_statut_change",
    valeurDeclencheur: "",
    action: "notifier_manager",
    valeurAction: "",
  });

  // Message d'erreur ou de succès
  const [message, setMessage] = useState(null);

  // =====================
  // CHARGEMENT DES RÈGLES
  // Se déclenche quand le projet sélectionné change
  // =====================
  useEffect(() => {
    if (!projetSelectionne) return;
    chargerRegles();
  }, [projetSelectionne]);

  // Charge les règles du projet sélectionné depuis l'API
  async function chargerRegles() {
    setChargement(true);
    try {
      const données = await getRegles(projetSelectionne);
      setRegles(Array.isArray(données) ? données : []);
    } catch (err) {
      console.error("Erreur chargement règles :", err);
    } finally {
      setChargement(false);
    }
  }

  // =====================
  // CRÉER UNE RÈGLE
  // =====================
  async function handleCreerRegle() {
    // Vérifie que le nom est rempli
    if (!formulaire.nom.trim()) {
      setMessage({
        type: "erreur",
        texte: "Le nom de la règle est obligatoire.",
      });
      return;
    }

    try {
      const nouvelle = await creerRegle(projetSelectionne, formulaire);
      if (nouvelle && nouvelle.id) {
        // Ajoute la nouvelle règle en tête de liste
        setRegles([nouvelle, ...regles]);
        setAfficherFormulaire(false);
        setFormulaire({
          nom: "",
          declencheur: "tache_statut_change",
          valeurDeclencheur: "",
          action: "notifier_manager",
          valeurAction: "",
        });
        setMessage({ type: "succes", texte: "Règle créée avec succès !" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({
        type: "erreur",
        texte: "Erreur lors de la création de la règle.",
      });
    }
  }

  // =====================
  // ACTIVER OU DÉSACTIVER UNE RÈGLE
  // =====================
  async function handleToggle(regleId) {
    try {
      const mise_a_jour = await toggleRegle(regleId);
      if (mise_a_jour) {
        // Met à jour l'état dans la liste sans recharger
        setRegles(regles.map((r) => (r.id === regleId ? mise_a_jour : r)));
      }
    } catch (err) {
      console.error("Erreur toggle règle :", err);
    }
  }

  // =====================
  // SUPPRIMER UNE RÈGLE
  // =====================
  async function handleSupprimer(regleId) {
    try {
      await supprimerRegle(regleId);
      // Retire la règle de la liste sans recharger
      setRegles(regles.filter((r) => r.id !== regleId));
      setMessage({ type: "succes", texte: "Règle supprimée." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Erreur suppression règle :", err);
    }
  }

  // =====================
  // STYLE RÉUTILISABLES
  // =====================
  const styleSelect = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    outline: "none",
    marginBottom: "10px",
  };

  const styleInput = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "10px",
    boxSizing: "border-box",
  };

  // =====================
  // RENDU DE LA PAGE
  // =====================
  return (
    <div style={{ maxWidth: "860px" }}>
      {/* ---- EN-TÊTE ---- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", color: "#999", marginBottom: "4px" }}>
            Créez des règles automatiques sur vos projets
          </div>
        </div>
        <button
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
          style={{
            fontSize: "13px",
            padding: "8px 16px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          {afficherFormulaire ? "Annuler" : "+ Nouvelle règle"}
        </button>
      </div>

      {/* ---- MESSAGE SUCCÈS / ERREUR ---- */}
      {message && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "1rem",
            background: message.type === "succes" ? "#EAF3DE" : "#FCEBEB",
            color: message.type === "succes" ? "#3B6D11" : "#A32D2D",
          }}
        >
          {message.texte}
        </div>
      )}

      {/* ---- SÉLECTEUR DE PROJET ---- */}
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
          style={{ fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}
        >
          Projet
        </div>
        <select
          value={projetSelectionne || ""}
          onChange={(e) => setProjetSelectionne(parseInt(e.target.value))}
          style={styleSelect}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* ---- FORMULAIRE DE CRÉATION ---- */}
      {afficherFormulaire && (
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
            Nouvelle règle automatique
          </div>

          {/* Nom de la règle */}
          <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>
            Nom de la règle
          </div>
          <input
            type="text"
            placeholder="Ex : Passer en haute priorité quand tâche terminée"
            value={formulaire.nom}
            onChange={(e) =>
              setFormulaire({ ...formulaire, nom: e.target.value })
            }
            style={styleInput}
          />

          {/* Déclencheur */}
          <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>
            Quand...
          </div>
          <select
            value={formulaire.declencheur}
            onChange={(e) =>
              setFormulaire({
                ...formulaire,
                declencheur: e.target.value,
                valeurDeclencheur: "",
              })
            }
            style={styleSelect}
          >
            {DECLENCHEURS.map((d) => (
              <option key={d.valeur} value={d.valeur}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Valeur du déclencheur si applicable */}
          {VALEURS_DECLENCHEUR[formulaire.declencheur]?.length > 0 && (
            <>
              <div
                style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}
              >
                Valeur du déclencheur
              </div>
              <select
                value={formulaire.valeurDeclencheur}
                onChange={(e) =>
                  setFormulaire({
                    ...formulaire,
                    valeurDeclencheur: e.target.value,
                  })
                }
                style={styleSelect}
              >
                <option value="">-- Choisir --</option>
                {VALEURS_DECLENCHEUR[formulaire.declencheur].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Action */}
          <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>
            Alors...
          </div>
          <select
            value={formulaire.action}
            onChange={(e) =>
              setFormulaire({
                ...formulaire,
                action: e.target.value,
                valeurAction: "",
              })
            }
            style={styleSelect}
          >
            {ACTIONS.map((a) => (
              <option key={a.valeur} value={a.valeur}>
                {a.label}
              </option>
            ))}
          </select>

          {/* Valeur de l'action si applicable */}
          {VALEURS_ACTION[formulaire.action]?.length > 0 && (
            <>
              <div
                style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}
              >
                Valeur de l'action
              </div>
              <select
                value={formulaire.valeurAction}
                onChange={(e) =>
                  setFormulaire({ ...formulaire, valeurAction: e.target.value })
                }
                style={styleSelect}
              >
                <option value="">-- Choisir --</option>
                {VALEURS_ACTION[formulaire.action].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Bouton créer */}
          <button
            onClick={handleCreerRegle}
            style={{
              width: "100%",
              padding: "10px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            Créer la règle
          </button>
        </div>
      )}

      {/* ---- LISTE DES RÈGLES ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
        }}
      >
        <div
          style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}
        >
          Règles actives — {regles.length} règle{regles.length > 1 ? "s" : ""}
        </div>

        {chargement && (
          <div
            style={{
              fontSize: "13px",
              color: "#aaa",
              textAlign: "center",
              padding: "1rem",
            }}
          >
            Chargement des règles...
          </div>
        )}

        {!chargement && regles.length === 0 && (
          <div
            style={{
              fontSize: "13px",
              color: "#aaa",
              textAlign: "center",
              padding: "1.5rem 0",
            }}
          >
            Aucune règle pour ce projet — créez votre première règle !
          </div>
        )}

        {/* Une carte par règle */}
        {regles.map((regle) => (
          <div
            key={regle.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "10px",
              opacity: regle.active ? 1 : 0.5,
              transition: "opacity 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              {/* Nom et description de la règle */}
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  {regle.nom}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {/* Affiche le déclencheur en français */}
                  {
                    DECLENCHEURS.find((d) => d.valeur === regle.declencheur)
                      ?.label
                  }
                  {regle.valeurDeclencheur && ` → ${regle.valeurDeclencheur}`}
                  {" ⟶ "}
                  {/* Affiche l'action en français */}
                  {ACTIONS.find((a) => a.valeur === regle.action)?.label}
                  {regle.valeurAction && ` (${regle.valeurAction})`}
                </div>
              </div>

              {/* Boutons activer/désactiver et supprimer */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexShrink: 0,
                  marginLeft: "1rem",
                }}
              >
                <button
                  onClick={() => handleToggle(regle.id)}
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    background: regle.active ? "#EAF3DE" : "#f0f0f0",
                    color: regle.active ? "#3B6D11" : "#888",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {regle.active ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => handleSupprimer(regle.id)}
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    background: "#fff0f0",
                    color: "#c0392b",
                    border: "1px solid #fdd",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageAutomatisations;
