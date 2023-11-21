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
import { UserLoginChecker } from './page_restriction.js';


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);


export function Signout() {
  //const userInfoDisplay = document.getElementById('user-info');
  const navbar_signout_btn = document.getElementById('navbar_signout_btn'); 

  if (navbar_signout_btn){
    // Add an event listener for the Sign Out button
    navbar_signout_btn.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          //userInfoDisplay.innerHTML = 'Signed out';
          console.log("Sign out")
          window.location.href = 'login.html'
        })
        .catch((error) => {
          console.error('Sign-out error:', error);
        });
    });
  }
}


window.addEventListener('load', Signout)

export function FetchCurrentUser() {
    return new Promise((resolve, reject) => {
      // Listen for changes in authentication state
      onAuthStateChanged(auth, (user) => {
        if (user) {  
          // User is signed in
          const currentUserID = user.uid;
          console.log("Current User UID:", currentUserID);
          resolve(currentUserID);
        } else {
          // No user is signed in
          console.log("No user is signed in.");
          resolve("None");
        }
      });
    });
  }

export function FetchNavbarProfile() { 

    const TestcolRef = collection(db, 'User Account');
  
    FetchCurrentUser().then((currentUserUID) => {
      const que = query(TestcolRef, where("userID", "==", currentUserUID));
  
      onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;

          const adminPersonalInfo = data.Personal_Information;
          
          const AccountInfo = data.Account_Information;

          const navbarProfPic = document.getElementById('navbarProfilePicture');
          const newImageUrl = AccountInfo.ProfilePictureURL;

          navbarProfPic.src = newImageUrl;

          const navbarUserName = document.getElementById('navbarUserName');
          const hoverUserName = document.getElementById('hoverUserName');
          const userLevel = document.getElementById('userLevel');

          navbarUserName.innerHTML = adminPersonalInfo.FirstName
          hoverUserName.innerHTML = adminPersonalInfo.FirstName
          userLevel.innerHTML = data.UserLevel
  
        });
  
      });
    });
  }
  
window.addEventListener('load', FetchNavbarProfile)

  