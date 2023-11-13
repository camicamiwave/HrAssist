import { initializeApp } from 'firebase/app'
import { 
    getFirestore, collection, onSnapshot, 
    addDoc, deleteDoc, doc,
    query, where,
    orderBy, serverTimestamp,
    getDoc, updateDoc
 } from 'firebase/firestore'

import {firebaseConfig} from './server.js';


// init firebase app
initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))


function GetApplicantTable() {
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

        const personal_info = data.Personal_Information;
        const ApplicantFullName = personal_info.FirstName + " " + personal_info.LastName;
        
        const createdAt = data.createdAt.toDate(); // Assuming createdAt is a timestamp
        // Extracting date only from createdAt
        const dateString = createdAt.toLocaleDateString();

        const idCell = document.createElement('td');
        idCell.textContent = id;

        const nameCell = document.createElement('td');
        nameCell.textContent = ApplicantFullName;

        const jobApplicationDateCell = document.createElement('td');
        jobApplicationDateCell.textContent = dateString;

        const applicantStatusCell = document.createElement('td');
        applicantStatusCell.textContent = data.ApplicantStatus;

        // Add button
        // Create a button element for actions and add it to the row
        const actionCell = document.createElement('td');
        const actionButtonEdit = document.createElement('button');
        //actionButtonEdit.textContent = 'Edit'; // Customize the button label
        actionButtonEdit.classList.add('btn', 'bx', 'bx-edit', 'mx-2'); // You can use Bootstrap's 'btn' and 'btn-primary' classes

        actionButtonEdit.addEventListener('click', () => {
          // Define an action for the Edit button (e.g., edit the record)
          // You can add your specific logic here
          console.log('Edit button clicked for record with ID:', id);
        });

        const actionButtonDelete = document.createElement('button');
        //actionButtonDelete.textContent = 'Delete'; // Customize the button label
        actionButtonDelete.classList.add('btn', 'bx', 'bx-trash'); // You can use Bootstrap's 'btn' and 'btn-danger' classes

        actionButtonDelete.addEventListener('click', () => {
          
          console.log('Delete button clicked for record with ID:', id);

        });
        
        actionCell.appendChild(actionButtonEdit);
        actionCell.appendChild(actionButtonDelete);

        // Add a click event listener to the row
        row.addEventListener('click', () => {
            console.log('Row ID clicked:', id);
        });

        // Append cells to the row 
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(jobApplicationDateCell);
        row.appendChild(applicantStatusCell);
        row.appendChild(actionCell);

        // Append the row to the table body
        tbody.appendChild(row);
      });
    });
  }


window.addEventListener('load', GetApplicantTable);