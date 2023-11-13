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
initializeApp(firebaseConfig)

// Get authentication object
const auth = getAuth();

const db = getFirestore()

export function EmployeeRequest() {
    document.getElementById('leaveBtn').addEventListener('click', function (e) {
        e.preventDefault();

        console.log("Leave Button");

        AddEmployeeRequest("Leave Request", "#LeaveRequestForm");
 
    });

    document.getElementById('passSlipBtn').addEventListener('click', function (e) {
        e.preventDefault();

        console.log("Pass Slip Button")

        AddEmployeeRequest("Pass Slip Request", "#LocatorForm");
 
    });

}

export function AddEmployeeRequest(RequestType, querySelectorID){

    const RequestcolRef = collection(db, 'Employee Request');

    // Listen for changes in authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Hello1")

            // User is signed in
            const currentUserID = user.uid;
            console.log("Current User UID:", currentUserID);
            

            // Move the form event listener outside if it doesn't depend on authentication state
            const addLeaveForm = document.querySelector(querySelectorID);
            addLeaveForm.addEventListener('submit', (e) => {
                e.preventDefault();

                let data;
            
                if (RequestType === "Leave Request"){
                    data = {
                        UserAccountID: currentUserID,
                        RequestType: "Leave Request",
                        FirstName: addLeaveForm.FirstName.value,
                        LastName: addLeaveForm.LastName.value,
                        leavetype: addLeaveForm.leavetype.value,
                        StartDate: addLeaveForm.StartDate.value,
                        EndDate: addLeaveForm.EndDate.value,
                        Reason: addLeaveForm.reason.value,
                        RequestStatus: "Pending",
                        createdAt: serverTimestamp()
                    };
                } else if (RequestType === "Pass Slip Request"){
                    data = {
                        UserAccountID: currentUserID,
                        RequestType: "Pass Slip Request",
                        FirstName: addLeaveForm.FirstName.value,
                        LastName: addLeaveForm.LastName.value,
                        Purpose: addLeaveForm.purpose.value,
                        StartDate: addLeaveForm.StartDate.value,
                        EndDate: addLeaveForm.EndDate.value,
                        Reason: addLeaveForm.reason.value,
                        RequestStatus: "Pending",
                        createdAt: serverTimestamp()
                    };
                }  

                // Add data to Firestore with an automatically generated ID
                addDoc(RequestcolRef, data)
                    .then((docRef) => {
                        const customDocId = docRef.id;
                        // Update the document with the custom ID
                        return setDoc(doc(RequestcolRef, customDocId), { documentID: customDocId }, { merge: true });
                    })
                    .then(() => {
                        addLeaveForm.reset();
                        console.log("Added request successfully...");
                    })
                    .catch(error => console.error('Error adding document:', error));
            });
        } else {
            // No user is signed in
            console.log("No user is signed in.");
        }
    });


}

window.addEventListener('load', EmployeeRequest); 


export function FetchEmployeeRequest(){
    
    const TestcolRef = collection(db, 'Employee Request');
  
    const que = query(TestcolRef, where("RequestStatus", "==", "Pending"))

    const TotalRequestLabel = document.getElementById("PendingRequestLabel");

    onSnapshot(que, (snapshot) => {
        let employees = [];
        snapshot.docs.forEach((doc) => {
          employees.push({ ...doc.data(), id: doc.id });
        });
        console.log(employees);
    
        if (employees.length > 0) {

            const total_request = employees.length;
            TotalRequestLabel.innerHTML = total_request;
            console.log(total_request);
            
        }
    });



}

window.addEventListener('load', FetchEmployeeRequest); 

// Using URL object
const url = new URL(window.location.href);
console.log(url.href , "request process pageee"); 
  