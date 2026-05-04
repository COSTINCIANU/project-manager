import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// On retire StrictMode pour éviter le double appel des useEffect en développement
createRoot(document.getElementById("root")).render(<App />);
