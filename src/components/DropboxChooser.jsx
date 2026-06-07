// =====================================================
// DropboxChooser.jsx — Sélecteur Dropbox
// Permet de sélectionner un fichier depuis Dropbox
// et d'insérer son lien dans la tâche
// Utilise le Dropbox Chooser officiel
// =====================================================
import { useEffect, useState } from "react";

const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY;

function DropboxChooser({ onFilePicked }) {
  // =====================
  // ÉTATS
  // =====================

  // Script Dropbox chargé
  const [dropboxLoaded, setDropboxLoaded] = useState(false);

  // =====================
  // CHARGEMENT DU SCRIPT DROPBOX
  // =====================
  useEffect(() => {
    // Vérifie si le script est déjà chargé
    if (window.Dropbox) {
      setDropboxLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.dropbox.com/static/api/2/dropins.js";
    script.setAttribute("data-app-key", DROPBOX_APP_KEY);
    script.id = "dropboxjs";
    script.onload = () => setDropboxLoaded(true);
    document.body.appendChild(script);

    return () => {
      // On ne supprime pas le script pour éviter de le recharger
    };
  }, []);

  // =====================
  // OUVRIR LE CHOOSER DROPBOX
  // =====================
  function handleClick() {
    if (!dropboxLoaded || !window.Dropbox) return;

    window.Dropbox.choose({
      // Succès — fichier sélectionné
      success: (files) => {
        const file = files[0];
        onFilePicked({
          name: file.name,
          url: file.link,
          id: file.id,
        });
      },
      // Annulation
      cancel: () => {},
      // Options
      linkType: "preview", // lien de prévisualisation
      multiselect: false, // un seul fichier à la fois
      extensions: [], // tous les types de fichiers
    });
  }

  // =====================
  // RENDU
  // =====================
  return (
    <button
      onClick={handleClick}
      disabled={!dropboxLoaded}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        background: !dropboxLoaded ? "#f0f0f0" : "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        cursor: !dropboxLoaded ? "not-allowed" : "pointer",
        fontSize: "13px",
        color: "#444",
        fontWeight: "500",
      }}
    >
      {/* Logo Dropbox */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0061FF">
        <path d="M12 2L6 6l6 4-6 4 6 4 6-4-6-4 6-4-6-4zM6 14l-6 4 6 4 6-4-6-4zm12 0l-6 4 6 4 6-4-6-4z" />
      </svg>
      {!dropboxLoaded ? "Chargement..." : "📦 Dropbox"}
    </button>
  );
}

export default DropboxChooser;
