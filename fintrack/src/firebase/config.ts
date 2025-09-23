
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyCf4W2fyrYp3rEL5AjZ0jyhUHpMshmmTYs",
  authDomain: "desafio-2-cf1a0.firebaseapp.com",
  projectId: "desafio-2-cf1a0",
  storageBucket: "desafio-2-cf1a0.firebasestorage.app",
  messagingSenderId: "946020557842",
  appId: "1:946020557842:",
    measurementId: "G-3LWGMNVSZQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 