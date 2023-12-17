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
    getDoc, updateDoc, setDoc, arrayUnion
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
const receivedString201File = urlParams.get('201filedoc');

export function Employee201Attachment() {
    try {
        const testBtn = document.getElementById('attachmentSubmitBtn');

        if (testBtn) {
            testBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Attachments");

                const storageRef = ref(storage, "Employee/Requirements/Attachments");

                const Attachments = window.AttachmentFiles;

                const allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpeg', 'jpg'];

                const isValidExtension = Attachments.every(file => {
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    return allowedExtensions.includes(fileExtension);
                });

                if (Attachments.length === 0) {
                    Swal.fire({
                        title: "No Files Uploaded",
                        text: "Please upload at least one file.",
                        icon: "error"
                    });
                    return; 
                } else if (!isValidExtension) {
                    Swal.fire({
                        title: "Invalid File Type",
                        text: "Please upload files with the following extensions: pdf, doc, docx, png, jpeg, jpg",
                        icon: "error"
                    });
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
                                const employeeDocRef = doc(EmployeecolRef, receivedString201File);

                                setDoc(employeeDocRef, { AttachmentURLs: arrayUnion(...fileURLs) }, { merge: true });
                            })
                            .then(() => {
                                console.log("Attachments added successfully...");
                                Swal.fire({
                                    position: "center",
                                    icon: "success",
                                    title: "Your work has been saved",
                                    showConfirmButton: false,
                                    timer: 1500
                                });
                            })
                            .catch((error) => {
                                console.error("Error adding attachments:", error);
                                // Handle errors
                            });
                    });
                }
            });
        } else {
            console.error("Button with ID 'appointmentSubmitBtn' not found.");
        }
    } catch (error) {
        console.log("Not Education form");
        console.error("Error:", error);
    }
}

window.addEventListener('load', Employee201Attachment);

export function fetchEmployee201Attachment() {
    try {
        // get the current employee data
        const EmployeecolRef = collection(db, '201File Information');
        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            const attachmentData = dataRetrieved.AttachmentURLs;

            console.log(dataRetrieved.documentID)

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
                    cell2.innerHTML = `<a href='${attachmentData[index]}' style='width: 60%; text-align: center'>Docs${num}</a>`;
                    //cell3.innerHTML = '<button type="button" class="btn btn-danger" style="width: 40%; text-align: center">Delete</button>';

                    // Assuming you have created the button and assigned it to the variable 'editButton'
                    const deleteButton = document.createElement('button');

                    deleteButton.textContent = `Delete`;
                    deleteButton.className = 'btn btn-danger';
                    deleteButton.id = `deletebtn${index}`;
                    deleteButton.type = 'button'

                    console.log(attachmentData,'asfsaf')

                    // Add an event listener to the button
                    deleteButton.addEventListener('click', function () {
                        console.log('delete mo', index)


                        Swal.fire({
                            title: "Are you sure?",
                            text: "Employee's attachment will be lost",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Confirm"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // If the user clicks "Confirm"

                                const itemList = attachmentData

                                // Alisin ang unang item (index 0)
                                itemList.splice(index, 1);

                                const newattachments = {
                                    AttachmentURLs: itemList
                                }

                                const EmployeecolRef = collection(db, '201File Information');
                                const employeeDocRef = doc(EmployeecolRef, dataRetrieved.documentID);


                                // Use setDoc to set the data in the document
                                return setDoc(employeeDocRef, newattachments,  { merge: true }).then(() => {
                                    alert('Attachment deleted successfully')
                                }).then(() => {
                                    window.location.href = `admin_201file_attachments.html?data=${encodeURIComponent(receivedStringData)}&201filedoc=${encodeURIComponent(dataRetrieved.documentID)}`;
                                })

                            } else {
                                // Handle the case where the user cancels the action
                            }
                        });


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
