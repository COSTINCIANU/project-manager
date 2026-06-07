// =====================================================
// GoogleDrivePicker.jsx — Sélecteur Google Drive
// Permet de sélectionner un fichier depuis Google Drive
// et d'insérer son lien dans la tâche
// Utilise Google Picker API
// =====================================================
import { useEffect, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

function GoogleDrivePicker({ onFilePicked }) {
  // =====================
  // ÉTATS
  // =====================

  // API Google chargée
  const [gapiLoaded, setGapiLoaded] = useState(false);

  // Google Identity Services chargé
  const [gisLoaded, setGisLoaded] = useState(false);

  // Token d'accès Google
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("google_access_token") || null,
  );

  // Chargement
  const [loading, setLoading] = useState(false);

  // =====================
  // CHARGEMENT DES SCRIPTS GOOGLE
  // =====================
  useEffect(() => {
    // Charge gapi (Google API)
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = () => {
      window.gapi.load("client:picker", () => {
        window.gapi.client
          .init({ discoveryDocs: DISCOVERY_DOCS })
          .then(() => setGapiLoaded(true));
      });
    };
    document.body.appendChild(gapiScript);

    // Charge GIS (Google Identity Services)
    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = () => setGisLoaded(true);
    document.body.appendChild(gisScript);

    return () => {
      document.body.removeChild(gapiScript);
      document.body.removeChild(gisScript);
    };
  }, []);

  // =====================
  // OUVRIR LE PICKER
  // =====================
  function openPicker(token) {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setDeveloperKey("")
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          // On retourne le lien du fichier sélectionné
          onFilePicked({
            name: file.name,
            url: file.url,
            id: file.id,
            mimeType: file.mimeType,
          });
        }
      })
      .build();

    picker.setVisible(true);
  }

  // =====================
  // AUTHENTIFICATION GOOGLE
  // =====================
  function handleClick() {
    if (!gapiLoaded || !gisLoaded) return;
    setLoading(true);

    // Si on a déjà un token sauvegardé on ouvre directement le picker
    const savedToken = localStorage.getItem("google_access_token");
    if (savedToken) {
      openPicker(savedToken);
      setLoading(false);
      return;
    }

    // Sinon on demande l'autorisation
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          // On sauvegarde le token pour éviter de redemander l'autorisation
          localStorage.setItem("google_access_token", response.access_token);
          setAccessToken(response.access_token);
          openPicker(response.access_token);
        }
        setLoading(false);
      },
    });

    tokenClient.requestAccessToken({ prompt: "" });
  }

  // =====================
  // RENDU
  // =====================
  return (
    <button
      onClick={handleClick}
      disabled={loading || !gapiLoaded || !gisLoaded}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        background: loading || !gapiLoaded || !gisLoaded ? "#f0f0f0" : "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        cursor:
          loading || !gapiLoaded || !gisLoaded ? "not-allowed" : "pointer",
        fontSize: "13px",
        color: "#444",
        fontWeight: "500",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M6 2l6 10H6z" />
        <path fill="#FBBC05" d="M6 2l6 10H0z" />
        <path fill="#34A853" d="M18 2l6 10H12z" />
        <path fill="#EA4335" d="M12 12l6 10H6z" />
      </svg>
      {loading ? "Chargement..." : "📁 Google Drive"}
    </button>
  );
}

export default GoogleDrivePicker;
