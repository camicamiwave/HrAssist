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

export function fetchEmployee201Attachment() {
    try {
        // get the current employee data
        const EmployeecolRef = collection(db, '201File Information');
        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            const attachmentData = dataRetrieved.AttachmentURLs;

            console.log(dataRetrieved.documentID)

            var tableBody = document.getElementById('attachmentsTable');

            // Clear existing rows
            tableBody.innerHTML = '';

            let num = 1;

            // Loop through the AttachmentURLs object and add rows to the table
            for (const index in attachmentData) {
                if (attachmentData.hasOwnProperty(index)) {
                    var row = tableBody.insertRow();
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);

                    // Set values for each cell
                    cell1.innerHTML = num; // You can set an ID or index here
                    cell2.innerHTML = `<a href='${attachmentData[index]}' style='width: 60%; text-align: center'>Docs${num}</a>`;
                    //cell3.innerHTML = '<button type="button" class="btn btn-danger" style="width: 40%; text-align: center">Delete</button>';

                    // Assuming you have created the button and assigned it to the variable 'editButton'
                    const deleteButton = document.createElement('button');

                    deleteButton.textContent = `View`;
                    deleteButton.className = 'btn btn-primary';
                    deleteButton.id = `deletebtn${index}`;
                    deleteButton.type = 'button'

                    // Add an event listener to the button
                    deleteButton.addEventListener('click', function () {
                        console.log('delete mo', index)
                        window.open(attachmentData[index], '_blank');
                    });

                    cell3.appendChild(deleteButton);


                }
                num++;
            }
        });

    } catch (error) {
        console.error("Error fetching attachment data:", error);
    }
}

window.addEventListener('load', fetchEmployee201Attachment);
