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
    getDoc, updateDoc, setDoc, getDocs
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';
import { FetchCurrentUser } from './employee_leave_form.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);



function SaveEmployeeDTR() {
    const DTR_Section = document.getElementById('tableSectionDTRSummary');
    const searchDTRBtn = document.getElementById('searchDTRBtn');
    const searchDTRLayout = document.getElementById('searchDTRLayout');
    
    const EmployeecolRef = collection(db, 'Employee Information');
    const DTRcolRef = collection(db, 'DTR Summary');
    const File201colRef = collection(db, '201File Information');
}

//window.addEventListener('load', SaveEmployeeDTR);

function ReturnDocumentID(docRef) {
    const DTRcolRef = collection(db, 'DTR Summary');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(DTRcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}



/*


            // Create a new row
            const row = tableBody.insertRow();


            fetchEmployeeInfo(DTRcolRef, data.documentID, "documentID").then((dataRetrieved) => {
                const EmployeeData = dataRetrieved;


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

                    
                    window.location.href = `admin-employee-opcrf.html?ipcrfid=${encodeURIComponent(ipcrfID)}&employeedocid=${encodeURIComponent(employeedocID)}`;

                })

                cell8.appendChild(viewButton);


                num++;


                
            })

*/