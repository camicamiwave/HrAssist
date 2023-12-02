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


const auth = getAuth();

const storage = getStorage(app);

function GetApplicantTable() {
    const colRef = collection(db, 'Request Information')
    const EmployeecolRef = collection(db, 'Employee Information')
    
    const q = query(colRef, orderBy('createdAt'))

  // Assuming you have Firestore data in the 'employees' array
  const employeeTable = document.getElementById('applicantTable');
  const tbody = employeeTable.querySelector('tbody');

  onSnapshot(q, (snapshot) => {
    // Clear the existing rows in the table body
    tbody.innerHTML = '';

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const row = document.createElement('tr');

      const employeedocID = data.employeeDocID
      

      fetchEmployeeInfo(EmployeecolRef, employeedocID, "employeeDocID").then((dataRetrieved) => {
        const employeedata = dataRetrieved;
        const personalInfo = dataRetrieved.Personal_Information;

        const ApplicantFullName = personalInfo.FirstName + " " + personalInfo.LastName;
  
        //const createdAt = data.createdAt.toDate(); // Assuming createdAt is a timestamp
        // Extracting date only from createdAt
        //const dateString = createdAt.toLocaleDateString();
  
        const imageElement = document.createElement('img');
  
        // Set the src attribute to the image URL
        imageElement.src = personalInfo.ProfilePictureURL;
        // Append the image element to the table cell
        const profileCell = document.createElement('td');
        profileCell.appendChild(imageElement);
  
        const idCell = document.createElement('td');
        idCell.textContent = data.ApplicantID;
  
        const nameCell = document.createElement('td');
        nameCell.textContent = ApplicantFullName;
  
        const jobApplicationDateCell = document.createElement('td');
        jobApplicationDateCell.textContent = dateString;
  
        const applicantStatusCell = document.createElement('td');
        applicantStatusCell.textContent = data.ApplicantStatus;
        
        if (data.ApplicantStatus.toLowerCase() === 'pending') {
          applicantStatusCell.classList.add('text-danger', );
          applicantStatusCell.style.fontWeight = 'bold';
        } else if (data.ApplicantStatus === 'Hired') {
          applicantStatusCell.classList.add('text-primary');
          applicantStatusCell.style.fontWeight = 'bold';
        }
        
        // Add button
        // Create a button element for actions and add it to the row
        const actionCell = document.createElement('td');
        const actionButtonEdit = document.createElement('button');
        //actionButtonEdit.textContent = 'Edit'; // Customize the button label
        actionButtonEdit.classList.add('btn', 'bx', 'bx-show', 'mx-5'); // You can use Bootstrap's 'btn' and 'btn-primary' classes
  
        actionButtonEdit.addEventListener('click', () => {
          // Define an action for the Edit button (e.g., edit the record)
          // You can add your specific logic here
          console.log('Edit button clicked for record with ID:', id);
  
          window.location.href = `admin_applicant_status.html?data=${encodeURIComponent(id)}`;
  
  
        });
   
  
        actionCell.appendChild(actionButtonEdit); 
   
        // Append cells to the row 
        //row.appendChild(profileCell); 
        row.appendChild(profileCell)
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(jobApplicationDateCell);
        row.appendChild(applicantStatusCell);
        row.appendChild(actionCell);
  
        // Append the row to the table body
        tbody.appendChild(row);
  



      })

    });
  });
}


window.addEventListener('load', GetApplicantTable);