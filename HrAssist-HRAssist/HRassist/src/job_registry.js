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

export function AddJobTitle() {
    const JobcolRef = collection(db, 'Job Information'); 
    const addJobTitleForm = document.querySelector("jobForm");

    let customDocId;


    addJobTitleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        console.log("submitted")

        const jobDetailsData = {
            createdAt: serverTimestamp(), 
            JobTitle: addJobTitleForm.inputJobTitle.value,
            JobType: addJobTitleForm.inputJobType.value,
            SalaryAmount: addJobTitleForm.inputSalaryAmount.value,
            DueDate: addJobTitleForm.inputDate.value,
            JobDesc: addJobTitleForm.inputJobDesc.value,
            JobRes: addJobTitleForm.inputJobResponsibility.value,
            Qualification: addJobTitleForm.inputJobQuality.value,
            NumVacancy: addJobTitleForm.inputJobVacancy.value,
            JobLocation: addJobTitleForm.inputJobLocation.value,
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Job details will be saved",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirm"
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Saved!",
                text: "Your job details added successfully...",
                icon: "success"
              }).then(() => {
                // Add data to Firestore
                return addDoc(JobcolRef, jobDetailsData);
              }).then((docRef) => {
                customDocId = docRef.id;
                // Update the document with the custom ID
                return setDoc(doc(JobcolRef, customDocId), { documentID: customDocId }, { merge: true });
              })
                .then(() => {
                  console.log("hereee: ", customDocId)
                  // Reset the form
                  addDataSheetForm.reset();
                  console.log("Added job details successfully...");
                  //window.location.href = 'Education-21Files.html';
                  //window.location.href = `Education-21Files.html?data=${encodeURIComponent(customDocId)}`;
                })
                .catch(error => console.error('Error adding job details document:', error));
            }
          });


    })

}


window.addEventListener('load', AddJobTitle)

window.addEventListener('load', () => {
    FetchCurrentUser().then((result) => {
        if (result) {
            console.log(result);
        } else {
            console.log("This page is for admin only.")
        }
    });
});