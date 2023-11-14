import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, updateProfile} from "firebase/auth";

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