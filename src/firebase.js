// Importation des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Configuration de ton projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCDWws1XUIzvEHByFVaqzCGazwNGvubS3c",
  authDomain: "project-manager-fc678.firebaseapp.com",
  projectId: "project-manager-fc678",
  storageBucket: "project-manager-fc678.firebasestorage.app",
  messagingSenderId: "285544328673",
  appId: "1:285544328673:web:6d281b8b438c280b2b76a0"
}

// Initialisation de Firebase
const app = initializeApp(firebaseConfig)

// Initialisation de Firestore — notre base de données
export const db = getFirestore(app)