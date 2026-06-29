// =====================================================
// PageJalons.jsx — Vue Jalons d'un projet
// Affiche les jalons sur une timeline avec
// possibilité de créer, modifier et supprimer
// =====================================================
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function PageJalons({ projects = [] }) {
  // =====================
  // ÉTATS
  // =====================
  const [projetId, setProjetId] = useState(projects.length > 0 ? projects[0].id : null);
  const [jalons, setJalons] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [jalonEnEdition, setJalonEnEdition] = useState(null);
  const [formulaire, setFormulaire] = useState({
    nom: "",
    description: "",
    date: "",
    couleur: "#378ADD",
  });

  // =====================
  // CHARGEMENT DES JALONS
  // =====================
  useEffect(() => {
    if (!projetId) return;
    chargerJalons();
  }, [projetId]);

  async function chargerJalons() {
    setChargement(true);
    try {
      const reponse = await fetch(`${API_URL}/projets/${projetId}/jalons`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      const données = await reponse.json();
      setJalons(Array.isArray(données) ? données : []);
    } catch (err) {
      console.error("Erreur chargement jalons :", err);
    } finally {
      setChargement(false);
    }
  }

  // =====================
  // CRÉER / MODIFIER UN JALON
  // =====================
  async function sauvegarderJalon() {
    if (!formulaire.nom || !formulaire.date) return;

    const url = jalonEnEdition ? `${API_URL}/jalons/${jalonEnEdition.id}` : `${API_URL}/jalons`;
    const methode = jalonEnEdition ? "PUT" : "POST";

    try {
      const reponse = await fetch(url, {
        method: methode,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ ...formulaire, projetId }),
      });
      await reponse.json();
      reinitialiserFormulaire();
      chargerJalons();
    } catch (err) {
      console.error("Erreur sauvegarde jalon :", err);
    }
  }

  // =====================
  // SUPPRIMER UN JALON
  // =====================
  async function supprimerJalon(id) {
    try {
      await fetch(`${API_URL}/jalons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` },
      });
      chargerJalons();
    } catch (err) {
      console.error("Erreur suppression jalon :", err);
    }
  }

  // =====================
  // MARQUER COMME ATTEINT
  // =====================
  async function toggleAtteint(jalon) {
    try {
      await fetch(`${API_URL}/jalons/${jalon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ atteint: !jalon.atteint }),
      });
      chargerJalons();
    } catch (err) {
      console.error("Erreur toggle atteint :", err);
    }
  }

  function ouvrirEdition(jalon) {
    setJalonEnEdition(jalon);
    setFormulaire({
      nom: jalon.nom,
      description: jalon.description || "",
      date: jalon.date,
      couleur: jalon.couleur || "#378ADD",
    });
    setAfficherFormulaire(true);
  }

  function reinitialiserFormulaire() {
    setFormulaire({ nom: "", description: "", date: "", couleur: "#378ADD" });
    setJalonEnEdition(null);
    setAfficherFormulaire(false);
  }

  // =====================
  // CALCUL POSITION SUR TIMELINE
  // =====================
  function getPositionJalon(date) {
    const today = new Date();
    const debut = new Date(today);
    debut.setDate(debut.getDate() - 30);
    const fin = new Date(today);
    fin.setDate(fin.getDate() + 60);

    const dateJalon = new Date(date);
    const totalMs = fin.getTime() - debut.getTime();
    const leftMs = dateJalon.getTime() - debut.getTime();
    const pct = (leftMs / totalMs) * 100;

    return Math.max(0, Math.min(100, pct));
  }

  const today = new Date();
  const debut = new Date(today);
  debut.setDate(debut.getDate() - 30);
  const fin = new Date(today);
  fin.setDate(fin.getDate() + 60);
  const totalMs = fin.getTime() - debut.getTime();
  const todayPct = ((today.getTime() - debut.getTime()) / totalMs) * 100;

  const styleSelect = {
    fontSize: "13px",
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    background: "#fff",
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

  // =====================
  // RENDU
  // =====================
  return (
    <div style={{ maxWidth: "100%" }}>
      {/* ---- EN-TÊTE ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1rem 1.5rem",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "500" }}>🏁 Jalons</span>

        {/* Sélecteur de projet */}
        <select
          value={projetId || ""}
          onChange={(e) => setProjetId(parseInt(e.target.value))}
          style={styleSelect}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Bouton ajouter */}
        <button
          onClick={() => setAfficherFormulaire(true)}
          style={{
            marginLeft: "auto",
            padding: "7px 16px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          + Ajouter un jalon
        </button>
      </div>

      {/* ---- FORMULAIRE CRÉATION / ÉDITION ---- */}
      {afficherFormulaire && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "14px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "1rem" }}>
            {jalonEnEdition ? "Modifier le jalon" : "Nouveau jalon"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div>
              <label
                style={{ fontSize: "11px", color: "#999", display: "block", marginBottom: "4px" }}
              >
                Nom du jalon *
              </label>
              <input
                type="text"
                placeholder="ex: Livraison MVP"
                value={formulaire.nom}
                onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
                style={styleInput}
              />
            </div>
            <div>
              <label
                style={{ fontSize: "11px", color: "#999", display: "block", marginBottom: "4px" }}
              >
                Date cible *
              </label>
              <input
                type="date"
                value={formulaire.date}
                onChange={(e) => setFormulaire({ ...formulaire, date: e.target.value })}
                style={styleInput}
              />
            </div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{ fontSize: "11px", color: "#999", display: "block", marginBottom: "4px" }}
            >
              Description
            </label>
            <input
              type="text"
              placeholder="Description optionnelle..."
              value={formulaire.description}
              onChange={(e) => setFormulaire({ ...formulaire, description: e.target.value })}
              style={styleInput}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <label style={{ fontSize: "11px", color: "#999" }}>Couleur</label>
            <input
              type="color"
              value={formulaire.couleur}
              onChange={(e) => setFormulaire({ ...formulaire, couleur: e.target.value })}
              style={{
                width: "40px",
                height: "32px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={sauvegarderJalon}
              style={{
                padding: "8px 20px",
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {jalonEnEdition ? "Enregistrer" : "Créer"}
            </button>
            <button
              onClick={reinitialiserFormulaire}
              style={{
                padding: "8px 16px",
                background: "#f5f5f5",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ---- TIMELINE DES JALONS ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "14px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "1.5rem", color: "#555" }}>
          Vue timeline — 30 jours passés · 60 jours à venir
        </div>

        {chargement ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: "2rem", fontSize: "13px" }}>
            Chargement...
          </div>
        ) : jalons.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: "2rem", fontSize: "13px" }}>
            Aucun jalon pour ce projet — cliquez sur "+ Ajouter un jalon"
          </div>
        ) : (
          <div style={{ position: "relative", height: `${jalons.length * 60 + 40}px` }}>
            {/* Ligne de base */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: 0,
                right: 0,
                height: "2px",
                background: "#eee",
              }}
            />

            {/* Ligne aujourd'hui */}
            <div
              style={{
                position: "absolute",
                left: `${todayPct}%`,
                top: 0,
                bottom: 0,
                width: "2px",
                background: "#378ADD",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${todayPct}%`,
                top: "4px",
                transform: "translateX(-50%)",
                fontSize: "9px",
                color: "#378ADD",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              Aujourd'hui
            </div>

            {/* Jalons */}
            {jalons.map((jalon, index) => {
              const pct = getPositionJalon(jalon.date);
              const dateJalon = new Date(jalon.date);
              const isPasse = dateJalon < today;

              return (
                <div
                  key={jalon.id}
                  style={{
                    position: "absolute",
                    left: `${pct}%`,
                    top: `${40 + index * 60}px`,
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {/* Ligne verticale vers la base */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-20px",
                      width: "1px",
                      height: "20px",
                      background: jalon.atteint ? "#639922" : jalon.couleur,
                      opacity: 0.6,
                    }}
                  />

                  {/* Marqueur */}
                  <div
                    onClick={() => toggleAtteint(jalon)}
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: jalon.atteint ? "#639922" : jalon.couleur,
                      border: "2px solid #fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    title={jalon.atteint ? "Marquer comme non atteint" : "Marquer comme atteint"}
                  />

                  {/* Carte jalon */}
                  <div
                    style={{
                      background: "#fff",
                      border: `1px solid ${jalon.atteint ? "#639922" : jalon.couleur}`,
                      borderRadius: "8px",
                      padding: "6px 10px",
                      minWidth: "120px",
                      maxWidth: "180px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: jalon.atteint ? "#639922" : "#222",
                        textDecoration: jalon.atteint ? "line-through" : "none",
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {jalon.atteint ? "✅ " : "🏁 "}
                      {jalon.nom}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: isPasse && !jalon.atteint ? "#e74c3c" : "#aaa",
                      }}
                    >
                      {dateJalon.toLocaleDateString("fr-FR")}
                      {isPasse && !jalon.atteint && " — En retard"}
                    </div>
                    {jalon.description && (
                      <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>
                        {jalon.description}
                      </div>
                    )}
                    {/* Boutons actions */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                      <span
                        onClick={() => ouvrirEdition(jalon)}
                        style={{ fontSize: "11px", color: "#378ADD", cursor: "pointer" }}
                      >
                        ✎ Modifier
                      </span>
                      <span
                        onClick={() => supprimerJalon(jalon.id)}
                        style={{ fontSize: "11px", color: "#e74c3c", cursor: "pointer" }}
                      >
                        ✕ Supprimer
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- LISTE DES JALONS ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "1.25rem",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "1rem", color: "#555" }}>
          Liste des jalons ({jalons.length})
        </div>
        {jalons.map((jalon) => {
          const dateJalon = new Date(jalon.date);
          const isPasse = dateJalon < today;
          return (
            <div
              key={jalon.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 0",
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              {/* Couleur + marqueur */}
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: jalon.atteint ? "#639922" : jalon.couleur,
                  flexShrink: 0,
                }}
              />
              {/* Infos */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: jalon.atteint ? "#639922" : "#222",
                    textDecoration: jalon.atteint ? "line-through" : "none",
                  }}
                >
                  {jalon.nom}
                </div>
                {jalon.description && (
                  <div style={{ fontSize: "11px", color: "#aaa" }}>{jalon.description}</div>
                )}
              </div>
              {/* Date */}
              <div
                style={{
                  fontSize: "12px",
                  color: isPasse && !jalon.atteint ? "#e74c3c" : "#aaa",
                  fontWeight: isPasse && !jalon.atteint ? "500" : "400",
                }}
              >
                {dateJalon.toLocaleDateString("fr-FR")}
                {isPasse && !jalon.atteint && " ⚠️"}
              </div>
              {/* Badge statut */}
              <div
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  background: jalon.atteint ? "#EAF3DE" : "#f5f5f5",
                  color: jalon.atteint ? "#3B6D11" : "#888",
                }}
              >
                {jalon.atteint ? "✅ Atteint" : "⏳ En cours"}
              </div>
              {/* Actions */}
              <div
                onClick={() => ouvrirEdition(jalon)}
                style={{ fontSize: "14px", color: "#ddd", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#378ADD")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
              >
                ✎
              </div>
              <div
                onClick={() => supprimerJalon(jalon.id)}
                style={{ fontSize: "16px", color: "#ddd", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e74c3c")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
              >
                ✕
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PageJalons;
