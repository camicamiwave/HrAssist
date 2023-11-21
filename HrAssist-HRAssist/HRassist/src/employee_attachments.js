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

export function Employee201Attachment() {
    try {
        const testBtn = document.getElementById('attachmentSubmitBtn');

        if (testBtn) {
            testBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Attachments")
                const urlParams = new URLSearchParams(window.location.search);
                const receivedStringData = urlParams.get('data');

                const storageRef = ref(storage, "Employee/Requirements/Attachments");

                const Attachments = window.AttachmentFiles;

                if (!Attachments || Attachments.length === 0) {
                    console.error("No files to upload.");
                    return;
                } else {

                    Swal.fire({
                        title: "Are you sure?",
                        text: "Employee's attachments will be saved",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Confirm"
                    }).then((result) => {
                        const downloadURLs = [];

                        Attachments.forEach((file, index) => {
                            const timestamp = new Date().getTime();
                            const uniqueFilename = `${timestamp}_${file.name}`;
                            const fileRef = ref(storageRef, uniqueFilename);

                            const uploadTask = uploadBytes(fileRef, file);

                            uploadTask
                                .then((snapshot) => getDownloadURL(fileRef))
                                .then((downloadURL) => {
                                    console.log(`Download URL for file ${index + 1}:`, downloadURL);
                                    downloadURLs.push(downloadURL);

                                    if (downloadURLs.length === Attachments.length) {
                                        saveDownloadURLsToFirestore(downloadURLs);
                                    }
                                })
                                .catch((error) => {
                                    console.error(`Error uploading file ${index + 1}:`, error);
                                });
                        });

                        function saveDownloadURLsToFirestore(downloadURLs) {
                            const EmployeecolRef = collection(db, '201File Information');
                            const Employeeque = query(EmployeecolRef, where("employeeDocID", "==", receivedStringData));

                            onSnapshot(Employeeque, (snapshot) => {
                                snapshot.docs.forEach((accountdocData) => {
                                    const data = accountdocData.data();
                                    const DocID = data.documentID;

                                    const employeeDocRef = doc(EmployeecolRef, DocID);


                                    const AttachmentURL = {};
                                    downloadURLs.forEach((url, index) => {
                                        AttachmentURL[index + 1] = url;
                                    });

                                    setDoc(employeeDocRef, { AttachmentURL }, { merge: true })
                                        .then(() => {
                                            console.log("Download URLs saved to Firestore");
                                            window.location.href = `201file_leave.html?data=${encodeURIComponent(receivedStringData)}`;
                                        })
                                        .catch((error) => {
                                            console.error("Error saving download URLs to Firestore:", error);
                                        });
                                });
                            });
                        }

                    })

                }
            });
        } else {
            console.error("Button with ID 'appointmentSubmitBtn' not found.");
        }

    } catch {
        console.log("Not Education form")

    }



}


window.addEventListener('load', Employee201Attachment)

