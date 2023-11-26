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

export function Employee201LeaveCredit() {
    const leaveSubmitBtn = document.getElementById('leaveSaveChanges');
    leaveSubmitBtn.addEventListener('click', (e) => {

        const leave_form = document.querySelector('#leaveCreditForm');
        if (leave_form) {

            const LeaveType = leave_form.leaveCreditLeaveType.value.trim()

            const leaveFormData = {
                Leave_Details: {
                    [LeaveType]: {
                        LeaveType: leave_form.leaveCreditLeaveType.value.trim(),
                        RemainingUnits: leave_form.leaveCreditRemainingUnits.value.trim(),
                        FromLeave: leave_form.leaveCreditFromLeave.value.trim(),
                        ToLeave: leave_form.leaveCreditToLeave.value.trim()
                    }
                }
            }

            Swal.fire({
                title: "Are you sure?",
                text: "Employee's leave credit will be saved",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Confirm"
            }).then((result) => {

                // get the current employee data
                const EmployeecolRef = collection(db, '201File Information');

                fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
                    const File201Data = dataRetrieved; 
                    const leaveData = dataRetrieved.Leave_Details;

                    const employeeDocRef = doc(EmployeecolRef, File201Data.documentID);
                    return setDoc(employeeDocRef, leaveFormData, { merge: true })    
                })
                

            }).then(() => {
                console.log("Added successfully...")
                hideEditModal()
            })
        }
    })


}

window.addEventListener('load', Employee201LeaveCredit)



export function fetchEmployee201LeaveCredit() {
    try {
        // get the current employee data
        const EmployeecolRef = collection(db, '201File Information');


        console.log("Retrieved Leave ID:", receivedStringData);


        fetchEmployeeInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
            const File201Data = dataRetrieved; 
            const leaveData = dataRetrieved.Leave_Details;

            var tableBody = document.getElementById('fileListBody');

            // Clear existing rows
            tableBody.innerHTML = '';
            let num = 1 
            // Loop through the Leave_Details object and add rows to the table
            for (var leaveType in leaveData) {
                if (leaveData.hasOwnProperty(leaveType)) {
                    var row = tableBody.insertRow();
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);

                    // Set values for each cell
                    cell1.innerHTML = num; // You can set an ID or index here
                    cell2.innerHTML = leaveData[leaveType].LeaveType;
                    cell3.innerHTML = leaveData[leaveType].RemainingUnits;
                    cell4.innerHTML = '<button onclick="openEditModal()" class="btn btn-primary">Edit</button>';

                }
                num++
            }


        });
        

    } catch (error) {
        console.error("Error fetching leave data:", error);
    }
}

window.addEventListener('load', fetchEmployee201LeaveCredit);
