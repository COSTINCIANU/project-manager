// =====================================================
// api.js — Fichier central de communication avec l'API
// Tous les appels vers le backend Symfony passent ici
// =====================================================

// URL de base de l'API Symfony
// En développement → utilise localhost
// En production → utilise la variable d'environnement VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// =====================
// AUTH — Gestion du token JWT
// =====================

// Récupère le token JWT stocké dans le navigateur après connexion
function getToken() {
  return localStorage.getItem("jwt_token");
}

// Génère les headers HTTP avec le token JWT
// Ces headers sont envoyés à chaque requête pour prouver qu'on est connecté
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`, // Format attendu par Symfony JWT
  };
}

// =====================================================
// GESTION HORS LIGNE — Mode offline
// Quand l'utilisateur n'a pas internet, on stocke ses
// actions dans localStorage et on les envoie quand
// la connexion revient
// =====================================================

// Liste des actions en attente (créer, modifier, supprimer)
// On charge depuis localStorage pour ne pas perdre les actions
// si l'utilisateur ferme l'app sans connexion
let pendingActions = JSON.parse(localStorage.getItem("pendingActions") || "[]");

// Sauvegarde une action dans la liste d'attente
// Appelé automatiquement quand navigator.onLine === false
function savePendingAction(method, url, body = null) {
  const action = { method, url, body, timestamp: Date.now() };
  pendingActions.push(action);
  // On persiste dans localStorage pour survivre à un rechargement de page
  localStorage.setItem("pendingActions", JSON.stringify(pendingActions));
  console.log("📴 Hors ligne — action sauvegardée:", action);
}

// Envoie toutes les actions en attente au serveur
// Appelé automatiquement quand la connexion revient
async function syncPendingActions() {
  if (pendingActions.length === 0) return;
  console.log(`🔄 Synchronisation de ${pendingActions.length} action(s)...`);

  for (const action of [...pendingActions]) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: authHeaders(),
        body: action.body ? JSON.stringify(action.body) : null,
      });
      // Supprime l'action de la liste une fois envoyée avec succès
      pendingActions = pendingActions.filter(
        (a) => a.timestamp !== action.timestamp,
      );
      localStorage.setItem("pendingActions", JSON.stringify(pendingActions));
    } catch (err) {
      console.error("❌ Echec sync action:", err);
    }
  }
  console.log("✅ Synchronisation terminée !");
}

// Écoute l'événement "online" du navigateur
// Quand la connexion revient → on synchronise automatiquement
window.addEventListener("online", () => {
  console.log("🟢 Connexion rétablie — synchronisation en cours...");
  syncPendingActions();
});

// Écoute l'événement "offline" du navigateur
window.addEventListener("offline", () => {
  console.log("🔴 Connexion perdue — mode hors ligne activé");
});

// =====================================================
// callAPI — Fonction centrale pour tous les appels API
// Tous les appels passent par ici pour gérer
// automatiquement le mode hors ligne
// =====================================================
async function callAPI(method, endpoint, body = null) {
  const url = `${API_URL}${endpoint}`;

  // Si pas de connexion → on stocke l'action pour plus tard
  if (!navigator.onLine) {
    savePendingAction(method, url, body);
    return null; // Les composants React doivent gérer le cas null
  }

  // Si connexion OK → on envoie la requête normalement
  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : null,
  });

  // Les requêtes DELETE ne retournent pas de données
  if (method === "DELETE") return null;

  return res.json();
}

// =====================================================
// PROJETS — CRUD complet
// Correspond aux routes /api/projects du backend Symfony
// =====================================================

// Récupère tous les projets de l'utilisateur connecté
export async function getProjets() {
  return callAPI("GET", "/projects");
}

// Crée un nouveau projet
// project = { name, description, status, ... }
export async function createProjet(project) {
  return callAPI("POST", "/projects", project);
}

// Modifie un projet existant par son id
// project = { name, description, status, ... }
export async function updateProjet(id, project) {
  return callAPI("PUT", `/projects/${id}`, project);
}

// Supprime un projet par son id
export async function deleteProjet(id) {
  return callAPI("DELETE", `/projects/${id}`);
}

// =====================================================
// TÂCHES — CRUD complet
// Correspond aux routes /api/tasks du backend Symfony
// =====================================================

// Récupère toutes les tâches (avec sous-tâches incluses)
export async function getTaches() {
  return callAPI("GET", "/tasks");
}

// Récupère une seule tâche par son id
export async function getTache(id) {
  return callAPI("GET", `/tasks/${id}`);
}

// Crée une nouvelle tâche
// task = {
//   name, description, priority, done, inProgress,
//   dueDate, projectId, estimatedTime, tags, assignedTo,
//   subTasks: [{ name, done }]
// }
export async function createTache(task) {
  return callAPI("POST", "/tasks", task);
}

// Modifie une tâche existante par son id
// Envoie uniquement les champs modifiés
export async function updateTache(id, task) {
  return callAPI("PUT", `/tasks/${id}`, task);
}

// Supprime une tâche et toutes ses sous-tâches (CASCADE)
export async function deleteTache(id) {
  return callAPI("DELETE", `/tasks/${id}`);
}

// =====================================================
// SOUS-TÂCHES — CRUD complet
// Correspond aux routes /api/tasks/{id}/subtasks
// Les sous-tâches appartiennent toujours à une tâche parente
// =====================================================

// Crée une nouvelle sous-tâche dans une tâche
// taskId = id de la tâche parente
// sousTache = { name, done }
export async function createSousTache(taskId, sousTache) {
  return callAPI("POST", `/tasks/${taskId}/subtasks`, sousTache);
}

// Modifie une sous-tâche existante (nom ou statut done)
// sousTache = { name, done }
export async function updateSousTache(id, sousTache) {
  return callAPI("PUT", `/tasks/subtasks/${id}`, sousTache);
}

// Supprime une sous-tâche par son id
export async function deleteSousTache(id) {
  return callAPI("DELETE", `/tasks/subtasks/${id}`);
}

// =====================================================
// COMMENTAIRES — CRUD complet
// Correspond aux routes /api/tasks/{id}/comments
// Les commentaires appartiennent toujours à une tâche
// =====================================================

// Récupère tous les commentaires d'une tâche
// taskId = id de la tâche parente
export async function getCommentaires(taskId) {
  return callAPI("GET", `/tasks/${taskId}/comments`);
}

// Ajoute un commentaire sur une tâche
// taskId = id de la tâche parente
// commentaire = { content: "texte du commentaire" }
export async function createCommentaire(taskId, commentaire) {
  return callAPI("POST", `/tasks/${taskId}/comments`, commentaire);
}

// Supprime un commentaire par son id
export async function deleteCommentaire(id) {
  return callAPI("DELETE", `/tasks/comments/${id}`);
}

// =====================================================
// UTILISATEURS
// Récupère la liste des utilisateurs pour l'assignation
// des tâches
// =====================================================

// Récupère tous les utilisateurs
export async function getUtilisateurs() {
  return callAPI("GET", "/users");
}
