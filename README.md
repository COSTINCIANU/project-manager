# 📊 Project Manager

Application de gestion de projets et de tâches développée avec React.

## 🚀 Aperçu

Project Manager est une application web permettant de gérer des projets et des tâches de manière simple et intuitive. Elle a été développée dans le cadre de mon dossier professionnel pour démontrer mes compétences en développement front-end avec React.

## ✨ Fonctionnalités

- **Dashboard** — Vue d'ensemble avec statistiques en temps réel
- **Gestion de projets** — Créer, suivre et supprimer des projets
- **Gestion de tâches** — Ajouter, modifier, supprimer et filtrer les tâches
- **Priorités** — Haute, moyenne, basse avec codes couleurs
- **Date d'échéance** — Suivi des deadlines avec alertes visuelles
- **Statistiques** — Graphiques de progression avec Recharts
- **Mode sombre** — Thème clair / sombre
- **Sauvegarde automatique** — Données persistantes avec localStorage
- **Filtres** — Par priorité et par projet

## 🛠️ Technologies utilisées

- **React** — Bibliothèque JavaScript pour l'interface utilisateur
- **Vite** — Outil de build rapide pour le développement
- **Recharts** — Bibliothèque de graphiques pour React
- **localStorage** — Persistance des données côté navigateur
- **CSS-in-JS** — Styles inline avec JavaScript

## 📁 Structure du projet

```
src/
├── components/
│   ├── Sidebar.jsx        # Navigation latérale
│   ├── StatCard.jsx       # Carte de statistique
│   ├── ProjectCard.jsx    # Carte de projet
│   ├── TaskItem.jsx       # Élément de tâche
│   ├── AddTaskForm.jsx    # Formulaire d'ajout de tâche
│   ├── ModalEditTask.jsx  # Modal de modification de tâche
│   ├── Graphique.jsx      # Graphique de progression
│   ├── PageProjets.jsx    # Page des projets
│   ├── PageStats.jsx      # Page des statistiques
│   ├── PageKanban.jsx     # Page Kanban drag & drop
│   └── ExportPDF.jsx      # Export rapport PDF
├── data/
│   └── initialData.js     # Données initiales
├── firebase.js            # Configuration Firebase
├── App.jsx                # Composant principal
└── main.jsx               # Point d'entrée
```

## ⚙️ Installation et lancement

### Prérequis
- Node.js v25.9.0
- npm

### Étapes

1. Cloner le repository
```bash
git clone https://github.com/COSTINCIANU/project-manager.git
```

2. Installer les dépendances
```bash
cd project-manager
npm install
```

3. Lancer le serveur de développement
```bash
npm run dev
```

4. Ouvrir dans le navigateur
http://localhost:5173


## 🎯 Compétences démontrées

- Création de composants React réutilisables
- Gestion d'état avec `useState` et `useEffect`
- Passage de props entre composants parent et enfant
- Persistance des données avec `localStorage`
- Intégration d'une bibliothèque externe (Recharts)
- Filtrage et manipulation de listes de données
- Design responsive et interface utilisateur professionnelle

## 👨‍💻 Auteur

**Costin Cianu**
- GitHub : [@COSTINCIANU](https://github.com/COSTINCIANU)

## 📄 Licence

Ce projet est réalisé dans le cadre d'un dossier professionnel.