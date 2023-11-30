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


const auth = getAuth();

const storage = getStorage(app);

function GetEmployeeTable() {
  const EmployeecolRef = collection(db, 'Employee Information');
  const q = query(EmployeecolRef, orderBy('createdAt'));

  try {
      // Assuming you have Firestore data in the 'employees' array
      const employeeTable = document.getElementById('employeeTable');
      const tbody = employeeTable.querySelector('tbody');

      onSnapshot(q, (snapshot) => {
          // Clear the existing rows in the table body
          tbody.innerHTML = '';

          if (!snapshot.empty) {
              snapshot.docs.forEach((doc) => {
                  const data = doc.data();
                  const id = doc.id;
                  const row = document.createElement('tr');

                  // Create and populate table cells
                  // Create an image element
                  const imageElement = document.createElement('img');

                  // Set the src attribute to the image URL
                  imageElement.src = data.ProfilePictureURL;

                  // Append the image element to the table cell
                  const profileCell = document.createElement('td');
                  profileCell.appendChild(imageElement);

                  const idCell = document.createElement('td');
                  idCell.textContent = data.incrementalAccountID;

                  const retrievefullName = `${data.Personal_Information.FirstName} ${data.Personal_Information.SurName}`;
                  console.log(retrievefullName);

                  const nameCell = document.createElement('td');
                  nameCell.textContent = retrievefullName;

                  const jobPositionCell = document.createElement('td');
                  jobPositionCell.textContent = data.userRole;

                  const genderCell = document.createElement('td');
                  genderCell.textContent = data.Personal_Information.Gender;

                  const statusCell = document.createElement('td');
                  //statusCell.textContent = data.Personal_Information.Status;

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
                  row.appendChild(genderCell);
                  row.appendChild(statusCell);
                  row.appendChild(jobTitleCell);

                  // Append the row to the table body
                  tbody.appendChild(row);
              });
          } else {
              // If there are no records, display a message
              const noRecordsRow = document.createElement('tr');
              const noRecordsCell = document.createElement('td');
              noRecordsCell.setAttribute('colspan', '7'); // Adjust the colspan based on the number of columns in your table
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
