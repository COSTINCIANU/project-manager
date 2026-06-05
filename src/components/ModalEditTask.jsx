// =====================================================
// ModalEditTask.jsx — Modal de modification d'une tâche
// Permet de modifier tous les champs d'une tâche :
// nom, description, priorité, projet, date d'échéance,
// temps estimé, tags, et sous-tâches
// =====================================================
import { useState, useEffect } from "react";
import {
  createSousTache,
  updateSousTache,
  deleteSousTache,
  getCommentaires,
  createCommentaire,
  deleteCommentaire,
  getUtilisateurs,
  getAttachments,
  uploadAttachment,
  deleteAttachment,
} from "../api";

function ModalEditTask({ task, projects, onSave, onClose, tasks }) {
  // =====================
  // ÉTATS DU FORMULAIRE
  // =====================

  // Nom de la tâche
  const [name, setName] = useState(task.name);

  // Description détaillée de la tâche
  const [description, setDescription] = useState(task.description || "");

  // Priorité : critique, haute, normale, basse
  const [priority, setPriority] = useState(task.priority || "normale");

  // Projet associé
  const [projectId, setProjectId] = useState(task.projectId);

  // Date d'échéance
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  // Temps estimé en minutes
  const [estimatedTime, setEstimatedTime] = useState(task.estimatedTime || "");

  // Tags — tableau de strings ex: ["bug", "urgent"]
  const [tags, setTags] = useState(task.tags || []);

  // Champ pour saisir un nouveau tag
  const [newTag, setNewTag] = useState("");

  // Sous-tâches — liste des sous-tâches de la tâche
  const [subTasks, setSubTasks] = useState(task.subTasks || []);

  // Champ pour saisir une nouvelle sous-tâche
  const [newSubTask, setNewSubTask] = useState("");

  // =====================
  // ÉTATS COMMENTAIRES
  // =====================

  // Liste des commentaires de la tâche
  const [comments, setComments] = useState([]);

  // Nouveau commentaire en cours de saisie
  const [newComment, setNewComment] = useState("");

  // Chargement des commentaires
  const [loadingComments, setLoadingComments] = useState(true);

  // =====================
  // ÉTATS FICHIERS
  // =====================

  // Liste des fichiers attachés à la tâche
  const [attachments, setAttachments] = useState([]);

  // Chargement des fichiers
  const [uploadingFile, setUploadingFile] = useState(false);

  // =====================
  // ÉTATS ASSIGNATION
  // =====================

  // Liste des utilisateurs disponibles pour l'assignation
  const [users, setUsers] = useState([]);

  // Utilisateur assigné à la tâche
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || "");

  // Dépendance — ID de la tâche bloquante
  const [dependsOn, setDependsOn] = useState(task.dependsOn || "");

  // =====================
  // CHARGEMENT DES COMMENTAIRES
  // =====================

  // Charge les commentaires et utilisateurs au chargement de la modal
  useEffect(() => {
    async function loadData() {
      // Charge les commentaires
      const commentsData = await getCommentaires(task.id);
      if (commentsData) setComments(commentsData);
      setLoadingComments(false);

      // Charge les utilisateurs pour l'assignation
      const usersData = await getUtilisateurs();
      if (usersData) setUsers(usersData);

      // Charge les fichiers
      const attachmentsData = await getAttachments(task.id);
      if (attachmentsData) setAttachments(attachmentsData);
    }
    loadData();
  }, [task.id]);

  // =====================
  // GESTION DES TAGS
  // =====================

  // Ajoute un tag à la liste si non vide et non dupliqué
  function handleAddTag() {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag("");
  }

  // Supprime un tag de la liste par son index
  function handleRemoveTag(index) {
    setTags(tags.filter((_, i) => i !== index));
  }

  // =====================
  // GESTION DES SOUS-TÂCHES
  // =====================

  // Ajoute une nouvelle sous-tâche via l'API
  async function handleAddSubTask() {
    if (!newSubTask.trim()) return;
    // On envoie la sous-tâche au backend Symfony
    const saved = await createSousTache(task.id, {
      name: newSubTask.trim(),
      done: false,
    });
    if (saved) {
      setSubTasks([...subTasks, saved]);
    }
    setNewSubTask("");
  }

  // Coche / décoche une sous-tâche
  async function handleToggleSubTask(subTask) {
    const updated = { ...subTask, done: !subTask.done };
    await updateSousTache(subTask.id, updated);
    setSubTasks(subTasks.map((st) => (st.id === subTask.id ? updated : st)));
  }

  // Supprime une sous-tâche
  async function handleDeleteSubTask(id) {
    await deleteSousTache(id);
    setSubTasks(subTasks.filter((st) => st.id !== id));
  }

  // =====================
  // GESTION DES COMMENTAIRES
  // =====================

  // Ajoute un nouveau commentaire
  async function handleAddComment() {
    if (!newComment.trim()) return;
    const saved = await createCommentaire(task.id, {
      content: newComment.trim(),
    });
    if (saved) setComments([...comments, saved]);
    setNewComment("");
  }

  // Supprime un commentaire
  async function handleDeleteComment(id) {
    await deleteCommentaire(id);
    setComments(comments.filter((c) => c.id !== id));
  }

  // =====================
  // GESTION DES FICHIERS
  // =====================

  // Upload un fichier sur la tâche
  async function handleUploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const saved = await uploadAttachment(task.id, file);
    if (saved) setAttachments([...attachments, saved]);
    setUploadingFile(false);
  }

  // Supprime un fichier
  async function handleDeleteAttachment(id) {
    await deleteAttachment(id);
    setAttachments(attachments.filter((a) => a.id !== id));
  }

  // Retourne l'icône selon le type de fichier
  function getFileIcon(mimeType) {
    if (!mimeType) return "📄";
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📕";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📊";
    return "📄";
  }

  // =====================
  // SAUVEGARDE
  // =====================

  function handleSave() {
    if (!name.trim()) return;

    // On envoie toutes les données modifiées au composant parent (App.jsx)
    onSave({
      ...task,
      name,
      description,
      priority,
      projectId: parseInt(projectId),
      dueDate,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
      tags,
      assignedTo: assignedTo ? parseInt(assignedTo) : null,
      dependsOn: dependsOn ? parseInt(dependsOn) : null,
    });

    onClose();
  }

  // =====================
  // STYLES RÉUTILISABLES
  // =====================

  const inputStyle = {
    width: "100%",
    fontSize: "13px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px",
    background: "#fff",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "12px",
    color: "#999",
    marginBottom: "6px",
  };

  // =====================
  // RENDU DE LA MODAL
  // =====================

  return (
    // Fond sombre — clic dessus pour fermer
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Boîte de la modal — scroll si contenu long */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "1.5rem",
          width: "500px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* ---- EN-TÊTE ---- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ fontSize: "15px", fontWeight: "500" }}>
            Modifier la tâche
          </div>
          <div
            onClick={onClose}
            style={{ cursor: "pointer", color: "#aaa", fontSize: "18px" }}
          >
            ✕
          </div>
        </div>

        {/* ---- NOM DE LA TÂCHE ---- */}
        <div style={labelStyle}>Nom de la tâche *</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          style={inputStyle}
          autoFocus
        />

        {/* ---- DESCRIPTION ---- */}
        <div style={labelStyle}>Description</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez la tâche en détail..."
          style={{
            ...inputStyle,
            minHeight: "80px",
            resize: "vertical",
            fontFamily: "sans-serif",
          }}
        />

        {/* ---- PRIORITÉ ---- */}
        <div style={labelStyle}>Priorité</div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={inputStyle}
        >
          <option value="critique">🔴 Critique</option>
          <option value="haute">🟠 Haute</option>
          <option value="normale">🟡 Normale</option>
          <option value="basse">🟢 Basse</option>
        </select>

        {/* ---- PROJET ---- */}
        <div style={labelStyle}>Projet</div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={inputStyle}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* ---- DATE D'ÉCHÉANCE ---- */}
        <div style={labelStyle}>Date d'échéance</div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={inputStyle}
        />

        {/* ---- TEMPS ESTIMÉ ---- */}
        <div style={labelStyle}>Temps estimé (en minutes)</div>
        <input
          type="number"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          placeholder="ex: 90 = 1h30"
          min="0"
          style={inputStyle}
        />

        {/* ---- ASSIGNATION ---- */}
        <div style={labelStyle}>Assigner à</div>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          style={inputStyle}
        >
          <option value="">— Non assigné —</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>

        {/* ---- DÉPENDANCE ---- */}
        <div style={labelStyle}>Dépend de (bloquée par)</div>
        <select
          value={dependsOn}
          onChange={(e) => setDependsOn(e.target.value)}
          style={inputStyle}
        >
          <option value="">— Aucune dépendance —</option>
          {Array.isArray(tasks) &&
            tasks
              .filter((t) => t.id !== task.id)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
        </select>

        {/* ---- TAGS ---- */}
        <div style={labelStyle}>Tags</div>

        {/* Affichage des tags existants */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "8px",
          }}
        >
          {tags.map((tag, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "#f0f0f0",
                borderRadius: "20px",
                padding: "3px 10px",
                fontSize: "12px",
                color: "#444",
              }}
            >
              {tag}
              {/* Bouton pour supprimer le tag */}
              <span
                onClick={() => handleRemoveTag(index)}
                style={{ cursor: "pointer", color: "#aaa", fontSize: "14px" }}
              >
                ×
              </span>
            </div>
          ))}
        </div>

        {/* Champ pour ajouter un nouveau tag */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Ajouter un tag..."
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          />
          <button
            onClick={handleAddTag}
            style={{
              padding: "8px 14px",
              background: "#f0f0f0",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            + Tag
          </button>
        </div>

        {/* ---- SOUS-TÂCHES ---- */}
        <div style={labelStyle}>Sous-tâches</div>

        {/* Liste des sous-tâches existantes */}
        {subTasks.map((st) => (
          <div
            key={st.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 0",
              borderBottom: "1px solid #f5f5f5",
            }}
          >
            {/* Checkbox pour cocher/décocher */}
            <input
              type="checkbox"
              checked={st.done}
              onChange={() => handleToggleSubTask(st)}
              style={{ cursor: "pointer" }}
            />
            {/* Nom de la sous-tâche */}
            <span
              style={{
                flex: 1,
                fontSize: "13px",
                color: st.done ? "#aaa" : "#333",
                textDecoration: st.done ? "line-through" : "none",
              }}
            >
              {st.name}
            </span>
            {/* Bouton supprimer */}
            <span
              onClick={() => handleDeleteSubTask(st.id)}
              style={{ cursor: "pointer", color: "#ddd", fontSize: "16px" }}
            >
              ×
            </span>
          </div>
        ))}

        {/* Champ pour ajouter une nouvelle sous-tâche */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginTop: "8px",
            marginBottom: "16px",
          }}
        >
          <input
            type="text"
            value={newSubTask}
            onChange={(e) => setNewSubTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubTask()}
            placeholder="Ajouter une sous-tâche..."
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          />
          <button
            onClick={handleAddSubTask}
            style={{
              padding: "8px 14px",
              background: "#f0f0f0",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            + Sous-tâche
          </button>
        </div>

        {/* ---- BOUTONS ---- */}
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Annuler */}
          <button
            onClick={onClose}
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

          {/* Sauvegarder */}
          <button
            onClick={handleSave}
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

        {/* ---- FICHIERS ---- */}
        <div style={labelStyle}>Fichiers joints</div>

        {/* Liste des fichiers */}
        {attachments.length === 0 ? (
          <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "8px" }}>
            Aucun fichier joint
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "#f9f9f9",
                borderRadius: "8px",
                marginBottom: "6px",
                fontSize: "12px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>{getFileIcon(attachment.mimeType)}</span>
                <span style={{ color: "#333" }}>{attachment.filename}</span>
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {/* Bouton télécharger */}

                <a
                  href={`http://project-manager-api.xena8933.odns.fr${attachment.url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#378ADD",
                    fontSize: "12px",
                    textDecoration: "none",
                  }}
                >
                  ⬇️
                </a>
                {/* Bouton supprimer */}
                <span
                  onClick={() => handleDeleteAttachment(attachment.id)}
                  style={{ cursor: "pointer", color: "#ddd", fontSize: "14px" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#e74c3c")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
                >
                  ×
                </span>
              </div>
            </div>
          ))
        )}

        {/* Bouton upload */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "inline-block",
              padding: "8px 14px",
              background: "#f0f0f0",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              color: "#444",
            }}
          >
            {uploadingFile ? "Upload en cours..." : "📎 Joindre un fichier"}
            <input
              type="file"
              onChange={handleUploadFile}
              style={{ display: "none" }}
              disabled={uploadingFile}
            />
          </label>
        </div>

        {/* ---- COMMENTAIRES ---- */}
        <div style={labelStyle}>Commentaires</div>

        {/* Liste des commentaires */}
        {loadingComments ? (
          <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "8px" }}>
            Chargement...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "8px" }}>
            Aucun commentaire pour l'instant
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "#f9f9f9",
                borderRadius: "8px",
                padding: "8px 10px",
                marginBottom: "6px",
                fontSize: "12px",
              }}
            >
              {/* En-tête du commentaire */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontWeight: "500", color: "#555" }}>
                  {comment.userEmail}
                </span>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <span style={{ color: "#aaa", fontSize: "11px" }}>
                    {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  {/* Bouton supprimer */}
                  <span
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{
                      cursor: "pointer",
                      color: "#ddd",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#e74c3c")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}
                  >
                    ×
                  </span>
                </div>
              </div>
              {/* Contenu du commentaire */}
              <div style={{ color: "#333", lineHeight: "1.4" }}>
                {comment.content}
              </div>
            </div>
          ))
        )}

        {/* Champ pour ajouter un commentaire */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Ajouter un commentaire..."
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          />
          <button
            onClick={handleAddComment}
            style={{
              padding: "8px 14px",
              background: "#f0f0f0",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEditTask;
