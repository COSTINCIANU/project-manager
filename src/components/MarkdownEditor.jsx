// =====================================================
// MarkdownEditor.jsx — Éditeur Markdown
// Permet d'écrire du Markdown avec prévisualisation
// en temps réel. Utilisé dans les descriptions de
// tâches et le Wiki par projet.
// =====================================================
import { useState } from "react";
import { marked } from "marked";

function MarkdownEditor({ value, onChange, placeholder, minHeight = "150px" }) {
  // =====================
  // ÉTATS
  // =====================

  // Mode actif — edit ou preview
  const [mode, setMode] = useState("edit");

  // =====================
  // RENDU
  // =====================
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "12px",
      }}
    >
      {/* ---- BARRE D'OUTILS ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          background: "#f9f9f9",
          borderBottom: "1px solid #ddd",
        }}
      >
        {/* Boutons raccourcis Markdown */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { label: "B", action: "**texte**", title: "Gras" },
            { label: "I", action: "_texte_", title: "Italique" },
            { label: "H1", action: "# Titre", title: "Titre" },
            { label: "•", action: "- élément", title: "Liste" },
            { label: "`", action: "`code`", title: "Code" },
          ].map((btn) => (
            <button
              key={btn.label}
              title={btn.title}
              onClick={() => onChange(value + btn.action)}
              style={{
                padding: "2px 8px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
                color: "#555",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Boutons mode Edit / Preview */}
        <div style={{ display: "flex", gap: "4px" }}>
          {["edit", "preview"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "2px 10px",
                background: mode === m ? "#111" : "#fff",
                color: mode === m ? "#fff" : "#555",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "500",
              }}
            >
              {m === "edit" ? "✏️ Éditer" : "👁️ Aperçu"}
            </button>
          ))}
        </div>
      </div>

      {/* ---- ZONE D'ÉDITION ---- */}
      {mode === "edit" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            placeholder ||
            "Écrivez en Markdown... **gras**, _italique_, # titre"
          }
          style={{
            width: "100%",
            minHeight: minHeight,
            padding: "10px 12px",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: "13px",
            lineHeight: "1.6",
            boxSizing: "border-box",
            background: "#fff",
          }}
        />
      )}

      {/* ---- PRÉVISUALISATION ---- */}
      {mode === "preview" && (
        <div
          style={{
            minHeight: minHeight,
            padding: "10px 12px",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "#222",
          }}
          dangerouslySetInnerHTML={{
            __html: value
              ? marked(value)
              : '<span style="color:#aaa">Aucun contenu</span>',
          }}
        />
      )}
    </div>
  );
}

export default MarkdownEditor;
