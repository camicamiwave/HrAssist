import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
    createUserWithEmailAndPassword } from "firebase/auth";
import {firebaseConfig} from './server.js';


console.log("sign out");

const app = initializeApp(firebaseConfig)

const auth = getAuth(app);


export function LoginMethod(){
    const userInfoDisplay = document.getElementById('user-info');
    const authForm = document.getElementById('auth-form');
    const signInButton = document.getElementById('sign-in-email-password');
    const signOutButton = document.getElementById('sign-out');
    
    // Add an event listener for the Email and Password Sign In button
    signInButton.addEventListener('click', () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
    
      signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              // User is signed in, you can display user information
              const user = userCredential.user;
              userInfoDisplay.innerHTML = `Signed in as123: ${user.displayName} (${user.email})`;
              console.log(`Signed in: ${user.email} `);
          })
          .catch((error) => {
              console.error('Email and Password Sign-In error:', error);
          });
    });
    
    // Add an event listener for the Sign Out button
    signOutButton.addEventListener('click', () => {
      signOut(auth)
          .then(() => {
              userInfoDisplay.innerHTML = 'Signed out';
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
          userInfoDisplay.innerHTML = `Signed in as: ${user.displayName} (${user.email})`;
          signInButton.style.display = 'none'; // Hide the Sign In button
          signOutButton.style.display = 'block'; // Show the Sign Out button
      } else {
          // User is signed out
          userInfoDisplay.innerHTML = 'Signed out';
          signInButton.style.display = 'block'; // Show the Sign In button
          signOutButton.style.display = 'none'; // Hide the Sign Out button
      }
    });
        
}



export function SignupAccount(){
    const signupForm = document.querySelector('.signup')
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const signup_email = signupForm.signup_email.value
        const signup_password = signupForm.signup_password.value

        console.log(signup_email)


        createUserWithEmailAndPassword(auth, signup_email, signup_password)
            .then((cred) => {
                
                console.log('user created: ', cred.user)
                signupForm.reset()
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode)
            });
        })
    }

window.addEventListener('load', LoginMethod);
window.addEventListener('load', SignupAccount);