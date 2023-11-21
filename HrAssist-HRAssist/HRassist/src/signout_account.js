import { initializeApp } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, updateProfile
} from "firebase/auth";

import { firebaseConfig } from './server.js';
import { UserLoginChecker } from './page_restriction.js';

const app = initializeApp(firebaseConfig)

const auth = getAuth(app);

export function LoginMethod() {
  //const userInfoDisplay = document.getElementById('user-info');
  const navbar_signout_btn = document.getElementById('navbar_signout_btn'); 

  // Add an event listener for the Sign Out button
  navbar_signout_btn.addEventListener('click', () => {
    signOut(auth)
      .then(() => {
        //userInfoDisplay.innerHTML = 'Signed out';
        console.log("Sign out")
      })
      .catch((error) => {
        console.error('Sign-out error:', error);
      });
  });
 
}



window.addEventListener('load', LoginMethod);