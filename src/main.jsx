import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import * as Sentry from "@sentry/react";

// =====================
// INITIALISATION SENTRY — Monitoring des erreurs en production
// =====================
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Active le monitoring uniquement en production
  enabled: import.meta.env.PROD,
  // Taux d'échantillonnage des performances (10%)
  tracesSampleRate: 0.1,
  // Taux d'échantillonnage des replays (10%)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Environnement
  environment: import.meta.env.MODE,
});

// On retire StrictMode pour éviter le double appel des useEffect en développement
createRoot(document.getElementById("root")).render(<App />);
