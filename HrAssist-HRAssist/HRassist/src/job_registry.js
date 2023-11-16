import Swal from 'sweetalert2';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, updateProfile
} from "firebase/auth";

import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js'; 
import { FetchCurrentUser } from './fetch_current_user.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

let jobForm;

export function AddJobTitle() {
    const addJobTitleForm = document.querySelector(querySelctorID); 

    

    const JobcolRef = collection(db, 'Job Information');

}




window.addEventListener('load', AddJobTitle)

window.addEventListener('load', () => {
    FetchCurrentUser().then((result) => {   
        if (result){
            console.log(result);
        } else {
            console.log("This page is for admin only.")
        }
    });
});