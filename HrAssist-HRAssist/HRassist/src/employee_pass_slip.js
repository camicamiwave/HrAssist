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
const received201filedoc = urlParams.get('201filedoc');


export function FetchCurrentUser() {
    return new Promise((resolve, reject) => {
        // Listen for changes in authentication state
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                const currentUserID = user.uid;
                //console.log("Current User UID:", currentUserID);
                resolve(currentUserID);
            } else {
                // No user is signed in
                console.log("No user is signed in.");
                resolve("None");
            }
        });
    });
}


export function EmployeeRequestForm() {
    const leaveSubmitBtn = document.getElementById('applyPassSlip');
    const pass_slip_form = document.querySelector('#passSlipForm');
    const TestcolRef = collection(db, 'User Account');
    const EmployeecolRef = collection(db, 'Employee Information');
    const RequestcolRef = collection(db, 'Request Information');

    FetchCurrentUser().then((currentUserUID) => {
        const que = query(TestcolRef, where("userID", "==", currentUserUID));

        onSnapshot(que, (snapshot) => {
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;
                const accountDocID = data.documentID;

                fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
                    const data = dataRetrieved;
                    const employeeDocID = data.documentID;

                    leaveSubmitBtn.addEventListener('click', (e) => {

                                        
                        if (validateForm()) {

                            if (pass_slip_form) {
                                const leaveFormData = {
                                    employeeDocID: employeeDocID,
                                    createdAt: serverTimestamp(),
                                    RequestType: 'Pass Slip Leave',
                                    RequestStatus: 'Pending',
                                    Request_Details: {
                                        PassSlipDate: document.getElementById('slipDate').value,
                                        PassSlipTime: document.getElementById('slipTime').value,
                                        PurposeSlip: document.getElementById('slipPurpose').value,
                                        PurposeStatement: document.getElementById('purposeText').value
                                    }
                                };

                                Swal.fire({
                                    title: "Are you sure?",
                                    text: "Your pass slip will be recorded",
                                    icon: "question",
                                    showCancelButton: true,
                                    confirmButtonColor: "#3085d6",
                                    cancelButtonColor: "#d33",
                                    confirmButtonText: "Confirm"
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        return addDoc(RequestcolRef, leaveFormData);
                                    } else {
                                        // User clicked "Cancel" or closed the dialog without confirming
                                        return Promise.reject(new Error('User canceled'));
                                    }
                                }).then((docRef) => {
                                    console.log(leaveFormData);
                                    ReturnDocumentID(docRef);
                                    return SaveAttachment(docRef);
                                }).then(() => {
                                    Swal.fire({
                                        title: 'Pass Slip Sent!',
                                        text: 'Please wait for further updates.',
                                        icon: 'success',
                                    });
                                    pass_slip_form.reset();
                                    console.log('Request saved...')
                                }).catch((error) => {
                                    if (error.message !== 'User canceled') {
                                        // Handle other errors
                                        console.error("Error occurred:", error);
                                        Swal.fire({
                                            title: 'Error',
                                            text: 'An error occurred while processing your request. Please try again.',
                                            icon: 'error',
                                        });
                                    }
                                });
                            }
                        } else {                
                            console.log('Form is not valid. Please correct errors.');
                        }
                        
                    });
                });
            });
        });
    });
}

window.addEventListener('load', EmployeeRequestForm)


function SaveAttachment(docRef) {
    const storageRef = ref(storage, "Employee Request/Pass Slip");
    const RequestcolRef = collection(db, 'Request Information');

    // Access the file input field
    const fileInput = document.getElementById('attachmentFile');
    const selectedFiles = fileInput.files;

    // Create an array to store download URLs
    const downloadURLs = [];

    // Loop through each selected file
    const uploadPromises = Array.from(selectedFiles).map((file) => {
        // Generate a unique filename using timestamp
        const timestamp = new Date().getTime();
        const uniqueFilename = `${timestamp}_${file.name}`;
        const fileRef = ref(storageRef, uniqueFilename);

        // Upload the file to Firebase Storage
        return uploadBytes(fileRef, file)
            .then((snapshot) => getDownloadURL(fileRef))
            .then((downloadURL) => {
                downloadURLs.push(downloadURL);
            });
    });

    // Wait for all uploads to complete
    Promise.all(uploadPromises)
        .then(() => {
            // All files are uploaded, and their URLs are in the downloadURLs array
            console.log(downloadURLs);
            
            const EmpcustomDocId = docRef.id;
            return setDoc(doc(RequestcolRef, EmpcustomDocId), { AttachmentsURL: downloadURLs }, { merge: true });

        })
        .catch((error) => {
            // Handle errors, if any
            console.error("Error uploading files:", error);
        });
}


function ReturnDocumentID(docRef) {
    const RequestcolRef = collection(db, 'Request Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(RequestcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}


function validateForm() {


         var locatorPurposeInput = document.getElementById('purposeText');
         var slipDateInput = document.getElementById('slipDate');
         var slipTimeInput = document.getElementById('slipTime');
         var attachmentFileInput = document.getElementById('attachmentFile');

            if (
            slipDateInput.value.trim() === '' ||
            slipTimeInput.value.trim() === '' ||
            locatorPurposeInput.value.trim() === '' ||
            attachmentFileInput.value.trim() === ''
          ) {
            alert('Please fill in all required fields.');
            return false;
          }
         
  
          if (!isValidString(locatorPurposeInput.value)) {
              alert('Please enter a valid input!');
              return false;
          }

          if (!isValidFileType(attachmentFileInput)) {
          alert('Please upload a valid file (PDF, DOC/DOCX, PNG, or JPEG).');
          return false;
      }

          return true;
      }


      function isValidString(value) {

          return /^[a-zA-Z\s]*$/.test(value.trim());
      }

      function isValidFileType(fileInput) {
      var fileName = fileInput.value;

      var fileExtension = fileName.split('.').pop().toLowerCase();


      var allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpeg', 'jpg'];

      return allowedExtensions.includes(fileExtension);
    }