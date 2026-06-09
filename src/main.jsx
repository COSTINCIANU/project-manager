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
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
  debug: false,
});

createRoot(document.getElementById("root")).render(<App />);
