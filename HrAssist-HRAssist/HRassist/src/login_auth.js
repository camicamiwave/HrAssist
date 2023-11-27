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
  const authForm = document.getElementById('auth-form');
  const signInButton = document.getElementById('sign-in-email-password');
  const signOutButton = document.getElementById('sign-out');
  const loginLabelh1 = document.getElementById('LoginLabel');

  // Add an event listener for the Email and Password Sign In button
  signInButton.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User is signed in, you can display user information
        const user = userCredential.user;

        if (user) {
          //userInfoDisplay.innerHTML = `Signed in as123: ${user.displayName} (${user.email})`;
          console.log(`Signed in: ${user.email} `);
          //window.location.href = 'index.html';

          UserLoginChecker(user.uid, "Login");
          alert("You are logged in.");
          //console.log("Userlevel: ", AccountUserLevel)
        } else { 
          alert("There is a login error. Please provide valid credentials.");
        }

      })
      .catch((error) => {
        console.error('Email and Password Sign-In error:', error);
        console.log("There is a login error. Please provide valid credentials.")
        alert("There is a login error. Please provide valid credentials.");
      });
  });


  // Add an event listener for the Sign Out button
  signOutButton.addEventListener('click', () => {
    signOut(auth)
      .then(() => {
        //userInfoDisplay.innerHTML = 'Signed out';
        console.log("Sign out")
      })
      .catch((error) => {
        console.error('Sign-out error:', error);
      });
  });


  // Add an event listener to detect changes in authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      //userInfoDisplay.innerHTML = `Signed in as: ${user.displayName} (${user.email})`;
      loginLabelh1.innerHTML = "You already login"
      signInButton.style.display = 'none'; // Hide the Sign In button
      signOutButton.style.display = 'block'; // Show the Sign Out button
    } else {
      // User is signed out
      //userInfoDisplay.innerHTML = 'Signed out';
      loginLabelh1.innerHTML = "Hello,Again" //"Login Account"
      signInButton.style.display = 'block'; // Show the Sign In button
      signOutButton.style.display = 'none'; // Hide the Sign Out button
    }
  });

}



window.addEventListener('load', LoginMethod);