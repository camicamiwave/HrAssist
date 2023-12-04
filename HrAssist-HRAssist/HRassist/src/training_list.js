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

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore() 

const storage = getStorage(app);

function fetchTraining() {

    try{
        const OfficecolRef = collection(db, 'Training Information');
        const que = query(OfficecolRef, orderBy('createdAt'));
    
        const tableBody = document.getElementById('trainingTable').getElementsByTagName('tbody')[0];

        onSnapshot(que, (snapshot) => { 
                        // Clear existing rows
            tableBody.innerHTML = '';

            let num = 1;
            snapshot.docs.forEach((doc) => {    
                const data = doc.data();
                const id = doc.id;
                // Create a new row
                const row = tableBody.insertRow();
    
                // Create cells and set values
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                const cell3 = row.insertCell(2);
                const cell4 = row.insertCell(3);
                const cell5 = row.insertCell(4); 
                const cell6 = row.insertCell(5); 
                const cell7 = row.insertCell(6);


                const trainingTitle = data.TrainingDetails.Title;
                const trainingParticipant = data.TrainingDetails.Participants;
                const trainingStartDate = data.TrainingDetails.StartDate;
                const trainingOrganizer = data.TrainingDetails.Organizer; 


                cell1.textContent = num;
                cell2.textContent = trainingTitle;
                cell3.textContent = data.TrainingDetails.Description;
                cell4.textContent = trainingParticipant;
                cell5.textContent = trainingOrganizer;
                cell6.textContent = trainingStartDate; 

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

                    const employeedocID = clickedRowData.documentID

                    // Log or process the data as needed
                    console.log('Clicked row data:', employeedocID);

                    
                    window.location.href = `admin_training_content.html?data=${encodeURIComponent(employeedocID)}`;

                })

                cell7.appendChild(viewButton);


                num++;


                 
    


            });
        });
    
    } catch {
        return
    }
}

// Call the fetchDepartments function to initiate the dynamic display
window.addEventListener('load', fetchTraining);


