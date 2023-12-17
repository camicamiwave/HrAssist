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

function fetchIPCRF() {
    const IPCRFcolRef = collection(db, 'IPCRF Information');
    const EmployeecolRef = collection(db, 'Employee Information');
    const Employee201colRef = collection(db, '201File Information');
    const tableBody = document.getElementById('ipcrfTable').getElementsByTagName('tbody')[0];

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

                fetchEmployeeInfo(EmployeecolRef, employeeID, "documentID").then((dataRetrieved) => {
                    const EmployeeData = dataRetrieved;

                    fetchEmployeeInfo(Employee201colRef, employeeID, "employeeDocID").then((dataRetrieved201) => {
                        const Employee201Data = dataRetrieved201;

                        // Create cells and set values
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        const cell3 = row.insertCell(2);
                        const cell4 = row.insertCell(3);
                        const cell5 = row.insertCell(4);
                        const cell6 = row.insertCell(5);
                        const cell7 = row.insertCell(6);
                        const cell8 = row.insertCell(7);
                        const fullname = `${EmployeeData.Personal_Information.FirstName} ${EmployeeData.Personal_Information.SurName}`
                        // Set values for each cell
                        cell1.textContent = num;
                        cell2.textContent = fullname;
                        cell3.textContent = Employee201Data.Appointment_Details.Office;
                        cell4.textContent = Employee201Data.Appointment_Details.PositionTitle;
                        cell5.textContent = data.ForTheSemester;
    
                        if (data.TotalRating >= 4.50) {
                            cell6.innerHTML = "Outstanding";
                        } if (data.TotalRating <= 4.449 && data.TotalRating >= 3.500) {
                            cell6.innerHTML = "Very Satisfactory"
                        } if (data.TotalRating >= 2.500 && data.TotalRating <= 3.499) {
                            cell6.innerHTML = "Satisfactory";
                        } if (data.TotalRating >= 1.500 && data.TotalRating <= 1.500) {
                            cell6.innerHTML = "Unsatisfactory";
                        } if (data.TotalRating <= 1.499) {
                            cell6.innerHTML = "Poor";
                        }
    
                        cell7.textContent = data.TotalRating;
    
                        //cell8.innerHTML = `<button onclick="deleteRow('${doc.id}')">View</button>`;
    
                        const viewButton = document.createElement('button');
    
                        viewButton.textContent = `View`;
                        viewButton.className = 'btn btn-primary';
                        viewButton.id = `viewbtn${num}`;
                        viewButton.type = 'button'
    
                        // Add an event listener to the button
                        viewButton.addEventListener('click', function () {
                            // Get the row index (subtracting 1 because row index starts from 0)
                            const rowIndex = this.id.replace('viewbtn', '') - 1;
    
                            // Get the data for the clicked row
                            const clickedRowData = snapshot.docs[rowIndex].data();
    
                            const ipcrfID = clickedRowData.documentID
                            const employeedocID = clickedRowData.employeeDocID
    
                            // Log or process the data as needed
                            console.log('Clicked row data:', clickedRowData);
    
    
                            window.location.href = `admin-employee-ipcrf.html?ipcrfid=${encodeURIComponent(ipcrfID)}&employeedocid=${encodeURIComponent(employeedocID)}`;
    
                        })
    
                        const deleteButton = document.createElement('button');
    
                        deleteButton.textContent = `Delete`;
                        deleteButton.className = 'btn btn-danger';
                        deleteButton.id = `viewbtn${num}`;
                        deleteButton.type = 'button'
    
                        // Add an event listener to the button
                        deleteButton.addEventListener('click', function () {
                            // Get the row index (subtracting 1 because row index starts from 0)
                            const rowIndex = this.id.replace('viewbtn', '') - 1;
    
                            // Get the data for the clicked row
                            const clickedRowData = snapshot.docs[rowIndex].data();
    
                            const employeedocID = clickedRowData.documentID
    
                            console.log("ea", employeedocID)
    
    
                            Swal.fire({
                                title: "Are you sure?",
                                text: "Employee's IPCRF will be lost",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33",
                                confirmButtonText: "Confirm"
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    // If the user clicks "Confirm"
                                    console.log('Row ID clicked:', employeedocID);
    
                                    const colRef = collection(db, 'IPCRF Information')
    
                                    const docRef = doc(colRef, employeedocID)
    
                                    deleteDoc(docRef)
                                        .then(() => {
                                            Swal.fire({
                                                title: 'Deleted Successfully!',
                                                text: 'IPCRF deleted.',
                                                icon: 'success',
                                            });
                                        })
    
                                } else {
                                    // Handle the case where the user cancels the action
                                }
                            });
    
                        })

                        cell8.appendChild(viewButton);
                        cell8.appendChild(deleteButton);

                        num++;
                    })
                })
            });
        }
    });
}

// Call the fetchIPCRF function when the window is loaded
window.addEventListener('load', fetchIPCRF);



// Function to delete a row by document ID
function deleteRow(docId) {
    // Implement the logic to delete the Firestore document with the given ID
    // You can use the docId to identify the document you want to delete
    console.log(`Deleting document with ID: ${docId}`);
}