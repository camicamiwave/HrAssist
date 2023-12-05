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


// init firebase app
app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Employee')

const auth = getAuth(app);

function AddEmployee() {
    // adding documents
    const addEmployeeForm = document.querySelector(".add_employee")
    addEmployeeForm.addEventListener('submit', (e) => {
        e.preventDefault()

        addDoc(colRef, {
            idnum: addEmployeeForm.idnum.value,
            fname: addEmployeeForm.fname.value,
            lname: addEmployeeForm.lname.value,
            email: addEmployeeForm.email.value,
            phonenum: addEmployeeForm.phonenum.value,
            createdAt: serverTimestamp()
        })
            .then(() => {
                addEmployeeForm.reset()
                console.log("Added employee successfully...")
            })

    })
}

export function AddApplicantInfo() {
    const ApplicanColRef = collection(db, 'Applicant Information')

    // adding documents
    const addApplicantForm = document.querySelector("#applicant_info_form")
    addApplicantForm.addEventListener('submit', (e) => {
        e.preventDefault()

        //const selectedSex = document.querySelector('input[name="sex"]:checked');
        //const sexValue = selectedSex ? selectedSex.value : null; 

        addDoc(ApplicanColRef, {
            inputFirstName: addApplicantForm.inputFirstName.value,
            inputMiddleName: addApplicantForm.inputMiddleName.value,
            inputLastName: addApplicantForm.inputLastName.value,
            inputExName: addApplicantForm.inputExName.value,
            //sex: sexValue,
            inputplacebirth: addApplicantForm.inputplacebirth.value,
            phone: addApplicantForm.phone.value,
            inputemail: addApplicantForm.inputemail.value,
            inputaddress: addApplicantForm.inputaddress.value,
            message: addApplicantForm.message.value,
            createdAt: serverTimestamp()

        })
            .then(() => {
                addApplicantForm.reset()
                console.log("Added employee successfully...")
            })

    })
}

export function AddLeaveRequest() { 
    
  document.getElementById('leaveBtn').addEventListener('click', function (e) {
    e.preventDefault();

    console.log("Hello")

    const RequestcolRef = collection(db, 'Leave Request');

    // Listen for changes in authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            const currentUserID = user.uid;
            console.log("Current User UID:", currentUserID);

            // Move the form event listener outside if it doesn't depend on authentication state
            const addLeaveForm = document.querySelector("#LeaveRequestForm");
            addLeaveForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const data = {
                    UserAccountID: currentUserID,
                    FirstName: addLeaveForm.FirstName.value,
                    LastName: addLeaveForm.LastName.value,
                    leavetype: addLeaveForm.leavetype.value,
                    StartDate: addLeaveForm.StartDate.value,
                    EndDate: addLeaveForm.EndDate.value,
                    Reason: addLeaveForm.reason.value,
                    LeaveStatus: "Pending",
                    createdAt: serverTimestamp()
                };

                // Add data to Firestore with an automatically generated ID
                addDoc(RequestcolRef, data)
                    .then((docRef) => {
                        const customDocId = docRef.id;
                        // Update the document with the custom ID
                        return setDoc(doc(RequestcolRef, customDocId), { documentID: customDocId }, { merge: true });
                    })
                    .then(() => {
                        addLeaveForm.reset();
                        console.log("Added leave request successfully...");
                    })
                    .catch(error => console.error('Error adding document:', error));
            });
        } else {
            // No user is signed in
            console.log("No user is signed in.");
        }
    });
    
  });

}

window.addEventListener('load', AddLeaveRequest);
window.addEventListener('load', AddApplicantInfo);
window.addEventListener('load', AddEmployee);
