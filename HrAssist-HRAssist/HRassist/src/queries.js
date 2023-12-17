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
    query, where, arrayUnion,
    orderBy, serverTimestamp,
    getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';
import { FetchCurrentUser } from './employee_leave_form.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);


console.log("hello")

console.log("hello world123")
console.log("hello world123")
console.log("hello world123")
console.log("hello world123")


function fetchOPCRF() {
    const IPCRFcolRef = collection(db, 'Query');
    const EmployeecolRef = collection(db, 'Employee Information');
    const Employee201colRef = collection(db, '201File Information');
    const tableBody = document.getElementById('contactTable').getElementsByTagName('tbody')[0];


    const que = query(IPCRFcolRef, orderBy('createdAt'));

    onSnapshot(que, (snapshot) => {
        // Clear existing rows
        tableBody.innerHTML = '';

        if (snapshot.docs.length === 0) {
            // Display "No records found" message
            const noRecordsRow = tableBody.insertRow();
            const noRecordsCell = noRecordsRow.insertCell(0);
            noRecordsCell.colSpan = 8;
            noRecordsCell.textContent = 'No records found';
        } else {
            let num = 1;

            snapshot.docs.forEach((empdoc) => {
                const data = empdoc.data();
                const employeeID = data.employeeDocID;

                // Create a new row
                const row = tableBody.insertRow();

                // Create cells and set values
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                const cell3 = row.insertCell(2);
                const cell4 = row.insertCell(3);
                const cell5 = row.insertCell(4);   

                cell1.style.textAlign = 'left'
                cell2.style.textAlign = 'left'
                cell3.style.textAlign = 'left'
                cell4.style.textAlign = 'left'  

                cell1.textContent = num;
                cell2.textContent = data.Name; 
                cell3.textContent = data.Subject;   

                const viewButton = document.createElement('button');

                viewButton.textContent = `View`;
                viewButton.className = 'btn btn-primary';
                viewButton.id = `viewbtn${num}`;
                viewButton.type = 'button'
                viewButton.style.fontSize = '12px' 

                // Add an event listener to the button
                viewButton.addEventListener('click', function () {
                                            
                    $('#addrewards').modal('show');

                    const rowIndex = this.id.replace('viewbtn', '') - 1;
                    const clickedRowData = snapshot.docs[rowIndex].data();

                    queryDate.innerHTML = clickedRowData.Name
                    queryName.innerHTML = clickedRowData.Email
                    querySubject.innerHTML = clickedRowData.Subject
                    message.innerHTML = clickedRowData.Message  
                    

                    console.log('Clicked row data:', clickedRowData);


                    closemodal.addEventListener('click', (e) => {                            
                        $('#addrewards').modal('hide');
                    })


                    
                    //window.location.href = `admin-employee-opcrf.html?ipcrfid=${encodeURIComponent(ipcrfID)}&employeedocid=${encodeURIComponent(employeedocID)}`;
                })

                const deleteButton = document.createElement('button');

                deleteButton.textContent = `Delete`;
                deleteButton.className = 'btn btn-danger';
                deleteButton.id = `viewbtn${num}`;
                deleteButton.type = 'button'
                deleteButton.style.fontSize = '12px'

                deleteButton.addEventListener('click', function () {
                    const rowIndex = this.id.replace('viewbtn', '') - 1;
                    const clickedRowData = snapshot.docs[rowIndex].data();
                    const employeedocID = clickedRowData.documentID

                    Swal.fire({
                        title: "Are you sure?",
                        text: "Employee's OPCRF will be lost",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Confirm"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            console.log('Row ID clicked:', employeedocID);
                            const colRef = collection(db, 'OPCRF Information')
                            const docRef = doc(colRef, employeedocID)
                            deleteDoc(docRef)
                                .then(() => {
                                    Swal.fire({
                                        title: 'Deleted Successfully!',
                                        text: 'OPCR deleted.',
                                        icon: 'success',
                                    });
                                })
                        } else {
                            // Handle the case where the user cancels the action
                        }
                    });

                })

                cell4.appendChild(viewButton);
                cell4.appendChild(deleteButton);

                num++;
            });
        }
    });
}

// Call the fetchOPCRF function when the window is loaded
window.addEventListener('load', fetchOPCRF);



// Function to delete a row by document ID
function deleteRow(docId) {
    // Implement the logic to delete the Firestore document with the given ID
    // You can use the docId to identify the document you want to delete
    console.log(`Deleting document with ID: ${docId}`);
}