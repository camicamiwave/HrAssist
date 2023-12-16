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
import { UserLoginChecker } from './page_restriction.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);
export function AddApplicantAccount() {
    const ContactsColRef = collection(db, 'Query');

    const signupForm = document.querySelector('#applicantAccountForm');

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const query_details = {
            createdAt: serverTimestamp(),
            Name: queryname.value,
            Email: queryemail.value,
            Subject: querysubject.value,
            Message: message.value
        }

        // Add data to Firestore with an automatically generated ID
        addDoc(ContactsColRef, query_details)
            .then((docRef) => {
                const accountCustomDocId = docRef.id; // No need for the outer variable
                // Update the document with the custom ID
                return setDoc(doc(ContactsColRef, accountCustomDocId), { documentID: accountCustomDocId }, { merge: true });
            })
            .then(() => {
                console.log("Query sent successfully...");
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Your query has been sent successfully",
                    showConfirmButton: true,
                    confirmButtonText: 'Confirm',
                }).then((result) => {
                    if (result.isConfirmed) {
                        signupForm.reset();
                    }
                });
            })
            .catch(error => {
                console.error('Error adding query document:', error);
            });
    });

    // No .catch block here
    // .catch((error) => {
    //     console.error('Error updating display name:', error);
    // });

}

window.addEventListener('load', AddApplicantAccount);