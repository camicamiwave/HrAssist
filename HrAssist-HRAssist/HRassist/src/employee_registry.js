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


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);


function GetEmployeeTable() {
  try {
    // Assuming you have Firestore data in the 'employees' array
    const employeeTable = document.getElementById('employeeTable');
    const tbody = employeeTable.querySelector('tbody');

    onSnapshot(q, (snapshot) => {
      // Clear the existing rows in the table body
      tbody.innerHTML = '';

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        const row = document.createElement('tr');

        // Create and populate table cells
        // Create an image element
        const imageElement = document.createElement('img');

        // Set the src attribute to the image URL
        imageElement.src = "https://firebasestorage.googleapis.com/v0/b/hrassist-lgusanvicente.appspot.com/o/Applicant%2FRequirements%2F1699720150322_bcert.png?alt=media&token=31d4f8c5-a4f2-4070-b104-624f27975f63";

        // Append the image element to the table cell
        const profileCell = document.createElement('td');
        profileCell.appendChild(imageElement);

        const idCell = document.createElement('td');
        idCell.textContent = id;

        const nameCell = document.createElement('td');
        nameCell.textContent = data.username;

        const jobPositionCell = document.createElement('td');
        jobPositionCell.textContent = data.userRole;

        const officeCell = document.createElement('td');
        officeCell.textContent = data.username;

        const genderCell = document.createElement('td');
        genderCell.textContent = data.username;

        const jobTitleCell = document.createElement('td');
        jobTitleCell.textContent = data.email;

        // Add a click event listener to the row
        row.addEventListener('click', () => {
          console.log('Row ID clicked:', id);
        });

        // Append cells to the row
        row.appendChild(profileCell);
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(jobPositionCell);
        row.appendChild(officeCell);
        row.appendChild(genderCell);
        row.appendChild(jobTitleCell);

        // Append the row to the table body
        tbody.appendChild(row);
      });
    });

  } catch {
    console.log("No data detected...")
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

    //alert(`Fullname:${LastName} ${FirstName} ${MiddleName} ${ExtName}`)

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
            window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(employeeDocID)}`;
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
