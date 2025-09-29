import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ COLE AQUI AS CONFIGURAÇÕES EXATAS DO FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCf4W2fyrYp3rEL5AjZ0jyhUHpMshmmTYs",
  authDomain: "desafio-2-cf1a0.firebaseapp.com",
  projectId: "desafio-2-cf1a0",
  storageBucket: "desafio-2-cf1a0.firebasestorage.app",
  messagingSenderId: "946020557842",
  appId: "1:946020557842:web:e656f85e9fddfff88ee4cb",
  measurementId: "G-3LWGMNVSZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Teste de inicialização
console.log("🔥 Firebase App inicializado:", app.name);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Teste do Firestore
console.log("📊 Firestore inicializado");

export default app;