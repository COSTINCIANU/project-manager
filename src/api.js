// URL de base de l'API Symfony
const API_URL = "https://127.0.0.1:8000/api";

// =====================
// FONCTIONS PROJETS
// =====================

// Récupérer tous les projets
export async function getProjets() {
  const res = await fetch(`${API_URL}/projects`);
  return res.json();
}

// Créer un projet
export async function createProjet(project) {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  return res.json();
}

// Modifier un projet
export async function updateProjet(id, project) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  return res.json();
}

// Supprimer un projet
export async function deleteProjet(id) {
  await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
  });
}

// =====================
// FONCTIONS TÂCHES
// =====================

// Récupérer toutes les tâches
export async function getTaches() {
  const res = await fetch(`${API_URL}/tasks`);
  return res.json();
}

// Créer une tâche
export async function createTache(task) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

// Modifier une tâche
export async function updateTache(id, task) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

// Supprimer une tâche
export async function deleteTache(id) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });
}
