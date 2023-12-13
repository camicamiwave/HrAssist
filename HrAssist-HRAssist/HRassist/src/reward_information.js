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

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);




function fetchPerformanceTable() {
    const DTRcolRef = collection(db, 'DTR Information');
    const EmployeecolRef = collection(db, 'Employee Information');
    const File201colRef = collection(db, '201File Information');

    const que = query(DTRcolRef);
    const tableBody = document.getElementById('tadinessTable').getElementsByTagName('tbody')[0];

    // for retrieving the current user
    onSnapshot(que, (snapshot) => {
        try {
            if (!snapshot.empty) {
                // Clear existing table rows
                tableBody.innerHTML = '';

                snapshot.docs.forEach((docData, index) => {
                    const data = docData.data();
                    const EmployeeDocID = data.employeeDocID;

                    // Create a new row
                    const newRow = tableBody.insertRow();

                    fetchEmployeeInfo(EmployeecolRef, EmployeeDocID, "documentID").then((dataRetrieved) => {
                        const employeeData = dataRetrieved;

                        
                        fetchEmployeeInfo(File201colRef, EmployeeDocID, "employeeDocID").then((dataRetrieved) => {
                            const file201employeeData = dataRetrieved;

                            // Add cells to the row with data
                            const cellID = newRow.insertCell(0);
                            const cell1 = newRow.insertCell(1);
                            const cell2 = newRow.insertCell(2);
                            const cell3 = newRow.insertCell(3);
                            const cell4 = newRow.insertCell(4);
                            const cell5 = newRow.insertCell(5); 
                            
                            // Apply CSS styling to center text in cells
                            cellID.style.textAlign = 'left';
                            cell1.style.textAlign = 'left';
                            cell2.style.textAlign = 'left';
                            cell3.style.textAlign = 'center';
                            cell4.style.textAlign = 'center';
                            cell5.style.textAlign = 'center';

                            const fullName = `${employeeData.Personal_Information.FirstName} ${employeeData.Personal_Information.SurName} `

                            // Populate cells with data
                            cellID.textContent = index + 1; // Auto-increment ID
                            cell1.textContent = fullName; 
                            cell2.textContent = file201employeeData.Appointment_Details.Office; 
                            cell3.textContent = file201employeeData.Appointment_Details.PositionTitle;  
                            cell4.textContent = data.Tardy_Details.TotalTimesTardy;  
                            cell5.textContent = data.Undertime_Details.TotalTimesUndertime;   

                        })
                    })                    
                });
            } else {
                // Display a message when there are no records
                tableBody.innerHTML = '<tr><td colspan="4">No records retrieved.</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching IPCRF data:", error);
            // Handle error (e.g., display an error message)
        }
    });
}

window.addEventListener('load', fetchPerformanceTable);




function fetchIPCRF() {
    const IPCRFcolRef = collection(db, 'IPCRF Information');
    const EmployeecolRef = collection(db, 'Employee Information');
    const Employee201colRef = collection(db, '201File Information');
    const tableBody = document.getElementById('ipcrfBody').getElementsByTagName('tbody')[0];

    const que = query(IPCRFcolRef, orderBy('createdAt'));

 
    onSnapshot(que, (snapshot) => {
        // Clear existing rows
        tableBody.innerHTML = '';

        let num = 1;

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
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

                    cell8.appendChild(viewButton);


                    num++;
                })
            })
        });
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