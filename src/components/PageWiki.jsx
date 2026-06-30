// =====================================================
// PageWiki.jsx — Wiki par projet
// Permet de créer et consulter des pages Wiki
// en Markdown pour chaque projet
// =====================================================
import { useState, useEffect } from "react";
import { marked } from "marked";
import MarkdownEditor from "./MarkdownEditor";

function PageWiki({ projects }) {
  // =====================
  // ÉTATS
  // =====================

  // Projet sélectionné
  const [selectedProject, setSelectedProject] = useState(projects?.[0]?.id || null);

  // Liste des pages Wiki du projet
  const [pages, setPages] = useState([]);

  // Page sélectionnée pour affichage
  const [selectedPage, setSelectedPage] = useState(null);

  // Mode — list, view, edit, create
  const [mode, setMode] = useState("list");

  // Champs du formulaire
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Chargement
  const [loading, setLoading] = useState(false);

  // Message
  const [message, setMessage] = useState("");

  // =====================
  // CHARGEMENT DES PAGES
  // =====================
  useEffect(() => {
    if (selectedProject) {
      loadPages(selectedProject);
    }
  }, [selectedProject]);

  async function loadPages(projectId) {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/wiki/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement wiki :", err);
    } finally {
      setLoading(false);
    }
  }

  // =====================
  // CRÉER UNE PAGE
  // =====================
  async function handleCreate() {
    if (!title.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/wiki`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({
          title,
          content,
          projectId: selectedProject,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPages([data, ...pages]);
        setMode("view");
        setSelectedPage(data);
        setMessage("Page créée !");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Erreur création page :", err);
    }
  }

  // =====================
  // MODIFIER UNE PAGE
  // =====================
  async function handleUpdate() {
    if (!title.trim() || !selectedPage) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/wiki/${selectedPage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();
      if (res.ok) {
        setPages(pages.map((p) => (p.id === data.id ? data : p)));
        setSelectedPage(data);
        setMode("view");
        setMessage("Page mise à jour !");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Erreur mise à jour page :", err);
    }
  }

  // =====================
  // SUPPRIMER UNE PAGE
  // =====================
  async function handleDelete(id) {
    if (!confirm("Supprimer cette page ?")) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/wiki/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });

      setPages(pages.filter((p) => p.id !== id));
      setSelectedPage(null);
      setMode("list");
    } catch (err) {
      console.error("Erreur suppression page :", err);
    }
  }

  // =====================
  // FORMATAGE DATE
  // =====================
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // =====================
  // RENDU
  // =====================
  return (
    // <div style={{ maxWidth: "900px", margin: "0 auto" }}>
    <div style={{ width: "100%" }}>
      {/* ---- SÉLECTEUR DE PROJET ---- */}
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
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "500" }}>📚 Wiki —</span>
        <select
          value={selectedProject || ""}
          onChange={(e) => {
            setSelectedProject(parseInt(e.target.value));
            setMode("list");
            setSelectedPage(null);
          }}
          style={{
            fontSize: "13px",
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            background: "#fff",
          }}
        >
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Bouton nouvelle page */}
        <button
          onClick={() => {
            setMode("create");
            setTitle("");
            setContent("");
          }}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          + Nouvelle page
        </button>
      </div>

      {/* Message succès */}
      {message && (
        <div
          style={{
            background: "#EAF3DE",
            color: "#3B6D11",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "14px",
          }}
        >
          ✅ {message}
        </div>
      )}

      <div style={{ display: "flex", gap: "14px" }}>
        {/* ---- LISTE DES PAGES ---- */}
        <div
          style={{
            width: "220px",
            flexShrink: 0,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#999",
              fontWeight: "500",
              marginBottom: "8px",
            }}
          >
            PAGES
          </div>

          {loading && <div style={{ fontSize: "12px", color: "#aaa" }}>Chargement...</div>}

          {!loading && pages.length === 0 && (
            <div style={{ fontSize: "12px", color: "#aaa" }}>Aucune page — créez la première !</div>
          )}

          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => {
                setSelectedPage(page);
                setMode("view");
              }}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                background: selectedPage?.id === page.id ? "#f0f0f0" : "transparent",
                color: selectedPage?.id === page.id ? "#111" : "#555",
                fontWeight: selectedPage?.id === page.id ? "500" : "400",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  selectedPage?.id === page.id ? "#f0f0f0" : "transparent")
              }
            >
              📄 {page.title}
            </div>
          ))}
        </div>

        {/* ---- CONTENU PRINCIPAL ---- */}
        <div style={{ flex: 1 }}>
          {/* Mode liste — aucune page sélectionnée */}
          {mode === "list" && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
                color: "#aaa",
                fontSize: "13px",
              }}
            >
              Sélectionnez une page ou créez-en une nouvelle
            </div>
          )}

          {/* Mode création */}
          {mode === "create" && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "1rem",
                }}
              >
                Nouvelle page Wiki
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "6px",
                }}
              >
                Titre
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la page..."
                style={{
                  width: "100%",
                  fontSize: "13px",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                }}
              />

              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "6px",
                }}
              >
                Contenu (Markdown)
              </div>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Rédigez votre page en Markdown..."
                minHeight="300px"
              />

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setMode("list")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#f5f5f5",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!title.trim()}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: !title.trim() ? "#aaa" : "#111",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: !title.trim() ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Créer la page
                </button>
              </div>
            </div>
          )}

          {/* Mode édition */}
          {mode === "edit" && selectedPage && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "1rem",
                }}
              >
                Modifier la page
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "6px",
                }}
              >
                Titre
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: "13px",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                }}
              />

              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "6px",
                }}
              >
                Contenu (Markdown)
              </div>
              <MarkdownEditor value={content} onChange={setContent} minHeight="300px" />

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setMode("view")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#f5f5f5",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  style={{
                    flex: 1,
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
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          {/* Mode visualisation */}
          {mode === "view" && selectedPage && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "1.5rem",
              }}
            >
              {/* En-tête */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: 0,
                    color: "#111",
                  }}
                >
                  {selectedPage.title}
                </h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setTitle(selectedPage.title);
                      setContent(selectedPage.content || "");
                      setMode("edit");
                    }}
                    style={{
                      padding: "6px 14px",
                      background: "#f0f0f0",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#555",
                    }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(selectedPage.id)}
                    style={{
                      padding: "6px 14px",
                      background: "#FCEBEB",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#A32D2D",
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>

              {/* Métadonnées */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#aaa",
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <span>👤 {selectedPage.authorEmail}</span>
                <span>📅 Créé le {formatDate(selectedPage.createdAt)}</span>
                {selectedPage.updatedAt && (
                  <span>✏️ Modifié le {formatDate(selectedPage.updatedAt)}</span>
                )}
              </div>

              {/* Contenu Markdown rendu */}
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#222",
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedPage.content
                    ? marked(selectedPage.content)
                    : '<span style="color:#aaa">Aucun contenu</span>',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageWiki;
