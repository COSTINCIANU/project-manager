import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import * as Sentry from "@sentry/react";

// =====================
// INITIALISATION SENTRY — Monitoring des erreurs en production
// =====================
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: true,
  // Capture 100% des erreurs
  tracesSampleRate: 1.0,
  // Replay sur erreur uniquement
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Environnement
  environment: import.meta.env.MODE,
  // Intégrations
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Ignore les erreurs non pertinentes
  ignoreErrors: ["JWT Token not found", "401", "Cross-Origin-Opener-Policy"],
});

createRoot(document.getElementById("root")).render(<App />);
