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

// init firebase app
app = initializeApp(firebaseConfig)

const db = getFirestore()

export function AddLeaveRequest() {
    console.log("check employee")

    
    document.getElementById('leaveBtn').addEventListener('click', function (e) {
        e.preventDefault();

        console.log("Hello")

        const RequestcolRef = collection(db, 'Leave Request');

        // Listen for changes in authentication state
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                const currentUserID = user.uid;
                console.log("Current User UID:", currentUserID);

                // Move the form event listener outside if it doesn't depend on authentication state
                const addLeaveForm = document.querySelector("#LeaveRequestForm");
                addLeaveForm.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const data = {
                        UserAccountID: currentUserID,
                        FirstName: addLeaveForm.FirstName.value,
                        LastName: addLeaveForm.LastName.value,
                        leavetype: addLeaveForm.leavetype.value,
                        StartDate: addLeaveForm.StartDate.value,
                        EndDate: addLeaveForm.EndDate.value,
                        Reason: addLeaveForm.reason.value,
                        LeaveStatus: "Pending",
                        createdAt: serverTimestamp()
                    };

                    // Add data to Firestore with an automatically generated ID
                    addDoc(RequestcolRef, data)
                        .then((docRef) => {
                            const customDocId = docRef.id;
                            // Update the document with the custom ID
                            return setDoc(doc(RequestcolRef, customDocId), { documentID: customDocId }, { merge: true });
                        })
                        .then(() => {
                            addLeaveForm.reset();
                            console.log("Added leave request successfully...");
                        })
                        .catch(error => console.error('Error adding document:', error));
                });
            } else {
                // No user is signed in
                console.log("No user is signed in.");
            }
        });

    });

}

window.addEventListener('load', AddLeaveRequest);

// Using URL object
const url = new URL(window.location.href);
console.log(url.href , "request process pageee"); 
  