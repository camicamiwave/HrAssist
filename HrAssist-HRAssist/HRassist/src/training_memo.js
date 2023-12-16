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
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');



export function fetchEmployeeTrainingMemo() {
    try {
        // get the current employee data
        const EmployeecolRef = collection(db, 'Calendar Information');
        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "documentID").then((dataRetrieved) => {
            const trainingdata = dataRetrieved.TrainingDetails;
            
            console.log(dataRetrieved, 'asdsdf')

            memoNumber.innerHTML = trainingdata.MemoNun;
            


            function formatDate(inputDate) {
                const months = [
                    'January', 'February', 'March', 'April',
                    'May', 'June', 'July', 'August',
                    'September', 'October', 'November', 'December'
                ];

                const parts = inputDate.split('-');
                const year = parts[0];
                const monthIndex = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
                const day = parseInt(parts[2], 10);

                const formattedDate = `${months[monthIndex]} ${day}, ${year}`;
                return formattedDate;
            }


            const startDate = trainingdata.StartDate

            // Example usage:
            const originalDate = '2023-12-07';
            const formattedDate = formatDate(startDate);

            memoDate.innerHTML = formattedDate

            if (trainingdata.Participants === "All") {
                memoTo.innerHTML = "All employees of LGU San Vicente"
            } else {
                memoTo.innerHTML = trainingdata.Participants
            }

            memoFrom.innerHTML = trainingdata.Organizer

            memoSubject.innerHTML = trainingdata.Description

            memoPurpose.innerHTML = trainingdata.Purpose




            console.log(formattedDate); // Output: "December 7, 2023"


        });


        requestLeaveBtn.addEventListener('click', (e) => {

            // Get the element you want to print
            const pdfContent = document.getElementById('pdfGenerateHere');

            // Open the print dialog
            window.print();

        })

    } catch (error) {
        console.error("Error fetching attachment data:", error);
    }
}

window.addEventListener('load', fetchEmployeeTrainingMemo);
