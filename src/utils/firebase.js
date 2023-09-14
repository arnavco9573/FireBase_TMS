import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCjqi8MX1AHXP02MsfkKl2ADjPTDu0Hcdg",
  authDomain: "task-5d9e3.firebaseapp.com",
  projectId: "task-5d9e3",
  storageBucket: "task-5d9e3.appspot.com",
  messagingSenderId: "146848019720",
  appId: "1:146848019720:web:aab8d3ad8e3649741b68bd",
};

let db = null;

export const initializeFirebase = ()=>{
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} 

export const getDB = () =>{
    return db;
}