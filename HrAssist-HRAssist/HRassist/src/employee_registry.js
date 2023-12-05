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
import { UserLoginChecker } from './page_restriction.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

async function GetEmployeeTable() {
  const EmployeecolRef = collection(db, 'Employee Information');
  const File201colRef = collection(db, '201File Information');


  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('officeID');
  //const receivedOfficeName = urlParams.get('officeName');

  const q = query(File201colRef, orderBy('createdAt'));
  //const query201 = query(File201colRef, where("Appointment_Details.Office", "==", receivedOfficeName))
 
  try {
    const employeeTable = document.getElementById('employeeTable');
    const tbody = employeeTable.querySelector('tbody');


    onSnapshot(q, async (snapshot) => {
      tbody.innerHTML = '';

      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const id = doc.id;
          const employee_ID = data.employeeDocID

          const row = document.createElement('tr');

          // Get designation from another collection
          try {
            const dataRetrieved = await fetchEmployeeInfo(EmployeecolRef, employee_ID, "documentID");

            const imageElement = document.createElement('img');
            imageElement.src = dataRetrieved.ProfilePictureURL;

            const profileCell = document.createElement('td');
            profileCell.appendChild(imageElement);

            const idCell = document.createElement('td');
            idCell.textContent = dataRetrieved.incrementalAccountID;

            const retrievefullName = `${dataRetrieved.Personal_Information.FirstName} ${dataRetrieved.Personal_Information.SurName}`;
            const nameCell = document.createElement('td');
            nameCell.textContent = retrievefullName;

            const officeCell = document.createElement('td');
            officeCell.textContent = data.Appointment_Details.Office;

            const jobPositionCell = document.createElement('td');
            jobPositionCell.textContent = data.Appointment_Details.PositionTitle;

            const employmentStatusCell = document.createElement('td');
            employmentStatusCell.textContent = data.Appointment_Details.PositionCategory;

            const statusCell = document.createElement('td');
            statusCell.textContent = dataRetrieved.employmentStatus;

            const deleteButtonCell = document.createElement('td');

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-primary');
            deleteButton.innerHTML = 'View'

            const deleteIcon = document.createElement('i');
            //deleteIcon.classList.add('bx', 'bx-edit');

            // Add a click event listener to the delete button
            deleteButton.addEventListener('click', () => {
              console.log('Row ID clicked:', id);

              window.location.href = `admin-employee-profile.html?data=${encodeURIComponent(dataRetrieved.documentID)}`;

            })

            deleteButton.appendChild(deleteIcon);
            deleteButtonCell.appendChild(deleteButton);

            row.appendChild(profileCell);
            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(officeCell);
            row.appendChild(jobPositionCell);
            row.appendChild(employmentStatusCell);
            row.appendChild(statusCell);
            row.appendChild(deleteButtonCell);

            tbody.appendChild(row);


          } catch (error) {
            console.error('Error fetching designation:', error);
          }
        }
      } else {
        const noRecordsRow = document.createElement('tr');
        const noRecordsCell = document.createElement('td');
        noRecordsCell.setAttribute('colspan', '7');
        noRecordsCell.textContent = 'No records found';
        noRecordsRow.appendChild(noRecordsCell);
        tbody.appendChild(noRecordsRow);
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

window.addEventListener('load', GetEmployeeTable);




export function SearchEmployee() {
  // Assuming you have an HTML form with id="employeeDataSheet"
  const SearchEmployeeForm = document.querySelector("#SearchEmployeeForm");
  const EmployeecolRef = collection(db, 'Employee Information');

  // Event listener for the form submission
  SearchEmployeeForm.addEventListener('submit', (e) => {
    e.preventDefault();


    const LastName = SearchEmployeeForm.inputLastName.value
    const FirstName = SearchEmployeeForm.inputFirstName.value
    const MiddleName = SearchEmployeeForm.inputMiddleName.value
    const ExtName = SearchEmployeeForm.inputExtName.value

    console.log(`Fullname:${FirstName}${MiddleName}${LastName}${ExtName}`)
    
    try {

      const conditions = [
        where("Personal_Information.FirstName", "==", FirstName.trim()),
        where("Personal_Information.MiddleName", "==", MiddleName.trim()),
        where("Personal_Information.SurName", "==", LastName.trim())
      ];

      if (ExtName !== "") {
        conditions.push(where("Personal_Information.ExName", "==", ExtName.trim()));
      }

      const que = query(EmployeecolRef, ...conditions);

      // for retrieving the current user
      onSnapshot(que, (snapshot) => {
        if (!snapshot.empty) {
          snapshot.docs.forEach((docData) => {
            const data = docData.data();
            const employeeDocID = data.documentID;

            console.log(data);
            alert("A record was retrieved.");
            window.location.href = `admin-employee-profile.html?data=${encodeURIComponent(employeeDocID)}`;
          });
        } else {
          alert("No record retrieved.");
          console.log("No record retrieved.");
        }
      });


    } catch {

      alert("No record retrieved.");
    }

  })

}

window.addEventListener('load', SearchEmployee)


