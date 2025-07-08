// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// Tu configuración actual
const firebaseConfig = {
  apiKey: "AIzaSyAIAa5DXV2j7BBcw_mxBlgq31vWCHlazo4",
  authDomain: "panel-rutas.firebaseapp.com",
  projectId: "panel-rutas",
  storageBucket: "panel-rutas.firebasestorage.app",
  messagingSenderId: "205591267963",
  appId: "1:205591267963:web:1b0206b270e981192df0de",
  measurementId: "G-X819HT62K1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
