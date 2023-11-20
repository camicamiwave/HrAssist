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

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);

export function ButtonNavigtor201File(customDocId) {
    const AccountBtn = document.getElementById('AccountBtn');
    const PersonalInfoBtn = document.getElementById('PersonalInfoBtn');
    const AppointmentBtn = document.getElementById('AppointmentBtn');
    const AttachmentBtn = document.getElementById('AttachmentBtn');
    const LeaveCreditBtn = document.getElementById('LeaveCreditBtn');

    AccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmAction("AccountBtn", customDocId)
    })

    PersonalInfoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmAction("PersonalInfoBtn", customDocId)
    })

    AppointmentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmAction("AppointmentBtn", customDocId)
    })

    AttachmentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmAction("AttachmentBtn", customDocId)
    })

    LeaveCreditBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmAction("LeaveCreditBtn", customDocId)
    })
}



// method for checking if the user wants to go to other pages
function confirmAction(category, documentID) {
    Swal.fire({
        title: "Are you sure?",
        text: `Your changes will be lost. Do you want to proceed?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed!"
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirect to the corresponding page based on the clicked link
            switch (category) {
                case 'AccountBtn':
                    //window.location.href = "datasheet.html";
                    window.location.href = `201file_account.html?data=${encodeURIComponent(documentID)}`;
                    break;
                case 'PersonalInfoBtn':
                    window.location.href = `datasheet.html?data=${encodeURIComponent(documentID)}`;
                    break;
                case 'AppointmentBtn':
                    //window.location.href = "OtherInfo-201file.html";
                    window.location.href = `201file_appointment.html?data=${encodeURIComponent(documentID)}`;
                    break;
                case 'AttachmentBtn':
                    //window.location.href = "signature-201file.html";
                    window.location.href = `201file_attachments.html?data=${encodeURIComponent(documentID)}`;
                    break;
                case 'LeaveCreditBtn':
                    //window.location.href = "signature-201file.html";
                    window.location.href = `201file_leave.html?data=${encodeURIComponent(documentID)}`;
                    break;
                default:
                    break;
            }
        }
    });
}

function URLDataRetriever() {
    return new Promise((resolve, reject) => {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');

        if (receivedStringData) {
            // Trigger to send document id when it was called
            ButtonNavigtor201File(receivedStringData);

            // Resolve the promise with the received string data
            resolve(receivedStringData);
        } else {
            ButtonNavigtor201File("");
            // Reject the promise if 'data' parameter is not found
            reject(new Error('No data parameter found in the URL'));
        }
    });
}

window.addEventListener('load', () => {
    URLDataRetriever()
        .then((data) => {
            console.log('Received data:', data);
            // Continue with your logic using the received data
        })
        .catch((error) => {
            console.error(error.message);
            // Handle the error, e.g., redirect to an error page or display a message
        });
});


export function Employee201Attachment() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');

        const testBtn = document.getElementById('attachmentSubmitBtn');

        if (testBtn) {
            testBtn.addEventListener('click', (e) => {
                e.preventDefault();
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


export function Employee201LeaveCredit(){
    
    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');

    const leaveSubmitBtn = document.getElementById('LeaveCreditsaveBtn');
    const leaveCreditForm = document.querySelector('#LeaveCreditForm');

    leaveSubmitBtn.addEventListener('click', (e) => {
        
        console.log("hello")

        

    })


}

window.addEventListener('load', Employee201LeaveCredit)

