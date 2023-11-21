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

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');

export function Employee201Attachment() {
    try {
        const testBtn = document.getElementById('attachmentSubmitBtn');

        if (testBtn) {
            testBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Attachments");

                const storageRef = ref(storage, "Employee/Requirements/Attachments");

                const Attachments = window.AttachmentFiles;

                Swal.fire({
                    title: "Are you sure?",
                    text: "Employee's attachments will be saved",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Confirm"
                }).then((result) => {
                    const uploadPromises = [];
                    const fileURLs = [];

                    for (let i = 0; i < Attachments.length; i++) {
                        const selectedFile = Attachments[i];
                        const timestamp = new Date().getTime();
                        const uniqueFilename = `${timestamp}_${selectedFile.name}`;
                        const fileRef = ref(storageRef, uniqueFilename);

                        const uploadPromise = uploadBytes(fileRef, selectedFile)
                            .then((snapshot) => getDownloadURL(fileRef))
                            .then((downloadURL) => {
                                fileURLs.push(downloadURL);
                            });

                        uploadPromises.push(uploadPromise);
                    }

                    Promise.all(uploadPromises)
                        .then(() => {
                            const attachmentsData = {
                                AttachmentURLs: fileURLs
                            };

                            const EmployeecolRef = collection(db, '201File Information');
                            const employeeDocRef = doc(EmployeecolRef, receivedStringData);

                            // Use setDoc to set the data in the document
                            setDoc(employeeDocRef, attachmentsData, { merge: true });
                        })
                        .then(() => {
                            console.log("Attachments added successfully...");
                            // Optionally, perform additional actions after attachments are added
                            window.location.href = `201file_leave.html?data=${encodeURIComponent(receivedStringData)}`;
                        })
                        .catch((error) => {
                            console.error("Error adding attachments:", error);
                            // Handle errors
                        });
                });
            });
        } else {
            console.error("Button with ID 'appointmentSubmitBtn' not found.");
        }
    } catch {
        console.log("Not Education form");
    }
}

window.addEventListener('load', Employee201Attachment);

export function fetchEmployee201Attachment() {
    try {
        // get the current employee data
        const EmployeecolRef = collection(db, '201File Information');

        console.log("Retrieved Leave ID:", receivedStringData);

        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "documentID").then((dataRetrieved) => {
            const attachmentData = dataRetrieved.AttachmentURLs;

            console.log(attachmentData, 'aet');

            var tableBody = document.getElementById('fileListBody');

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
                    cell2.innerHTML = `<a href='${attachmentData[index]}'>Docs${num}</a>`;
                    cell3.innerHTML = '<button onclick="performAction()">Action</button>';
                }
                num++;
            }
        });

    } catch (error) {
        console.error("Error fetching attachment data:", error);
    }
}

window.addEventListener('load', fetchEmployee201Attachment);
