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
import { FetchCurrentUser } from './employee_pass_slip.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')


export function EmployeeComplaintForm() {
    const complaintBtn = document.getElementById('complaintSubmit');
    const complaint_form = document.querySelector('#complaintForm');

    const TestcolRef = collection(db, 'User Account');
    const EmployeecolRef = collection(db, 'Employee Information');
    const ComplaintcolRef = collection(db, 'Complaint Information');

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

                    complaintBtn.addEventListener('click', (e) => {

                        // Kumukuha ng kasalukuyang petsa
                        const currentDate = new Date();

                        // Kunin ang year, month, at day mula sa current date
                        const year = currentDate.getFullYear();
                        const month = currentDate.getMonth() + 1; // Note: Ang buwan ay zero-based, kaya't kailangan idagdag ng 1
                        const day = currentDate.getDate();

                        if (CompName.value !== "" && ComplaintEmail.value !== "" && ComplaintMessage.value !== "" && NatureOfComplaint.value !== ""
                            && PersonComplaint.value !== "" && ComplaintDetails.value !== "") {
                            if (complaint_form) {
                                const leaveFormData = {
                                    employeeDocID: employeeDocID,
                                    createdAt: serverTimestamp(),
                                    Complaint_Details: {
                                        ComplaintDate: `${year}-${month}-${day}`,
                                        ComplaintName: document.getElementById('CompName').value,
                                        ComplaintEmail: document.getElementById('ComplaintEmail').value,
                                        ComplaintMessage: document.getElementById('ComplaintMessage').value,
                                        NatureOfComplaint: document.getElementById('NatureOfComplaint').value,
                                        PersonComplaint: document.getElementById('PersonComplaint').value,
                                        ComplaintDetails: document.getElementById('ComplaintDetails').value
                                    }
                                };

                                Swal.fire({
                                    title: "Are you sure?",
                                    text: "Your complaint will be reported.",
                                    icon: "question",
                                    showCancelButton: true,
                                    confirmButtonColor: "#3085d6",
                                    cancelButtonColor: "#d33",
                                    confirmButtonText: "Confirm"
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        return addDoc(ComplaintcolRef, leaveFormData);
                                    } else {
                                        // User clicked "Cancel" or closed the dialog without confirming
                                        return Promise.reject(new Error('User canceled'));
                                    }
                                }).then((docRef) => {
                                    console.log(leaveFormData);
                                    return ReturnDocumentID(docRef);
                                }).then(() => {
                                    return Swal.fire({
                                        title: 'Complaint Sent!',
                                        text: 'Thank you for submitting your complaint. Please wait for further notice while the HR team processes your complaint.',
                                        icon: 'success',
                                    });
                                })
                                    .then((result) => {
                                        if (result.isConfirmed) {
                                            // Redirect to the dashboard page after the user clicks "OK"
                                            window.location.href = '`employee_home`.html';
                                            complaint_form.reset();
                                            console.log('Complaint saved...')
                                        } else {
                                            // Handle the case where the user closed the dialog without confirming
                                            return Promise.reject(new Error('User canceled'));
                                        }
                                    })
                                    .catch((error) => {
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

                            } else {
                                //alert('Please provide the required fields. Thank you!')
                                Swal.fire({
                                    title: 'Error',
                                    text: 'Please provide the required fields. Thank you!',
                                    icon: 'error',
                                });
                            }
                        } else {
                            //alert('Please provide the required fields. Thank you!')
                            Swal.fire({
                                title: 'Error',
                                text: 'Please provide the required fields. Thank you!',
                                icon: 'error',
                            });

                        }

                    });
                });
            });
        });
    });
}

window.addEventListener('load', EmployeeComplaintForm)


function ReturnDocumentID(docRef) {
    const RequestcolRef = collection(db, 'Complaint Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(RequestcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}

